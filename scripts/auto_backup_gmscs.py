import sys, os, json, subprocess, urllib.request, time, zipfile, hashlib
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ID = "gmscs-a9925"

# 대상 백업 디렉토리 목록 (구글 드라이브 및 외장하드)
BACKUP_TARGET_DIRS = [
    r"G:\내 드라이브\GMSCS_Backup",
    r"D:\GMSCS_Backup",
    r"C:\GMSCS_Backup"
]

COLLECTIONS = [
    "companies",
    "auditors",
    "audit_documents",
    "institution_info",
    "auditor_trainings",
    "auditor_notices"
]

def get_auth_token():
    try:
        token = subprocess.check_output(['gcloud.cmd', 'auth', 'print-access-token'], text=True).strip()
        return token
    except Exception as e:
        print(f"❌ 토큰 발급 실패: {e}")
        return None

def from_firestore_field(field_obj):
    if not isinstance(field_obj, dict):
        return field_obj
    if "stringValue" in field_obj:
        return field_obj["stringValue"]
    elif "integerValue" in field_obj:
        return int(field_obj["integerValue"])
    elif "doubleValue" in field_obj:
        return float(field_obj["doubleValue"])
    elif "booleanValue" in field_obj:
        return field_obj["booleanValue"]
    elif "nullValue" in field_obj:
        return None
    elif "arrayValue" in field_obj:
        values = field_obj["arrayValue"].get("values", [])
        return [from_firestore_field(v) for v in values]
    elif "mapValue" in field_obj:
        fields = field_obj["mapValue"].get("fields", {})
        return {k: from_firestore_field(v) for k, v in fields.items()}
    return field_obj

def fetch_collection(token, collection_name):
    headers = {'Authorization': f'Bearer {token}'}
    all_docs = []
    page_token = None
    
    while True:
        url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{collection_name}?pageSize=300"
        if page_token:
            url += f"&pageToken={page_token}"
        
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                documents = data.get("documents", [])
                for doc in documents:
                    doc_id = doc["name"].split("/")[-1]
                    fields = doc.get("fields", {})
                    parsed = {k: from_firestore_field(v) for k, v in fields.items()}
                    parsed["_id"] = doc_id
                    all_docs.append(parsed)
                page_token = data.get("nextPageToken")
                if not page_token:
                    break
        except Exception as e:
            print(f"⚠️ 컬렉션 {collection_name} 조회 오류: {e}")
            break
            
    return all_docs

def run_backup():
    print("=" * 65)
    print("🚀 GMSCS 클라우드 DB ➔ 구글드라이브 & 외장하드 풀 백업 엔진 가동")
    print("=" * 65)
    
    token = get_auth_token()
    if not token:
        sys.exit(1)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_data = {
        "metadata": {
            "timestamp": timestamp,
            "backupDate": datetime.now().isoformat(),
            "projectId": PROJECT_ID,
            "system": "GMSCS Certification Management Platform 2026",
            "collectionsCount": len(COLLECTIONS)
        },
        "collections": {}
    }
    
    summary_counts = {}
    for col in COLLECTIONS:
        print(f"📦 [{col}] 컬렉션 전수 덤프 중...", end=" ")
        docs = fetch_collection(token, col)
        backup_data["collections"][col] = docs
        summary_counts[col] = len(docs)
        print(f"➔ {len(docs)}건 수집 완료")
        
    backup_data["metadata"]["summary"] = summary_counts
    
    # 임시 JSON 파일 생성
    temp_dir = os.path.join(os.path.dirname(__file__), "..", "scratch")
    os.makedirs(temp_dir, exist_ok=True)
    temp_json_path = os.path.join(temp_dir, f"gmscs_dump_{timestamp}.json")
    temp_zip_path = os.path.join(temp_dir, f"GMSCS_FullBackup_{timestamp}.zip")
    
    with open(temp_json_path, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
    # ZIP 압축 및 SHA-256 해시 계산
    with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(temp_json_path, arcname=f"GMSCS_Database_Dump_{timestamp}.json")
        
    with open(temp_zip_path, "rb") as f:
        sha256_hash = hashlib.sha256(f.read()).hexdigest()
        
    file_size_mb = os.path.getsize(temp_zip_path) / (1024 * 1024)
    print("-" * 65)
    print(f"🔒 백업 압축 완료: {file_size_mb:.2f} MB (SHA-256: {sha256_hash[:16]}...)")
    print("-" * 65)
    
    # 구글 드라이브 및 외장하드로 다중 복제
    success_targets = []
    for target_dir in BACKUP_TARGET_DIRS:
        drive_root = os.path.splitdrive(target_dir)[0]
        if drive_root and not os.path.exists(drive_root):
            print(f"⏭️ 드라이브 {drive_root} 미연결로 건너뜀: {target_dir}")
            continue
            
        try:
            os.makedirs(target_dir, exist_ok=True)
            dst_zip = os.path.join(target_dir, f"GMSCS_FullBackup_{timestamp}.zip")
            dst_meta = os.path.join(target_dir, "latest_backup_manifest.json")
            
            # 파일 복사
            with open(temp_zip_path, "rb") as sf, open(dst_zip, "wb") as df:
                df.write(sf.read())
                
            manifest = {
                "latestBackup": f"GMSCS_FullBackup_{timestamp}.zip",
                "timestamp": timestamp,
                "backupDate": datetime.now().isoformat(),
                "fileSizeBytes": os.path.getsize(temp_zip_path),
                "sha256": sha256_hash,
                "summary": summary_counts
            }
            with open(dst_meta, "w", encoding="utf-8") as mf:
                json.dump(manifest, mf, ensure_ascii=False, indent=2)
                
            success_targets.append(target_dir)
            print(f"✅ [저장 성공] {target_dir}")
        except Exception as e:
            print(f"❌ [저장 실패] {target_dir}: {e}")
            
    # 임시 파일 정리
    try:
        os.remove(temp_json_path)
    except:
        pass
        
    print("=" * 65)
    print(f"🎉 GMSCS 3-2-1 다중 백업 완결! 저장 위치 ({len(success_targets)}개소):")
    for t in success_targets:
        print(f"   • {t}")
    print("=" * 65)

if __name__ == "__main__":
    run_backup()
