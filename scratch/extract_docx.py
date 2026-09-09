import zipfile, xml.etree.ElementTree as ET, glob, os, sys

sys.stdout.reconfigure(encoding='utf-8')

def extract_docx(path):
    with zipfile.ZipFile(path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        texts = []
        for elem in tree.iter():
            if elem.tag.endswith('}t'):
                texts.append(elem.text or '')
            elif elem.tag.endswith('}p'):
                texts.append('\n')
        full = ''.join(texts)
        lines = [l.strip() for l in full.split('\n') if l.strip()]
        return lines

files = glob.glob('Remark/*.docx')
with open('Remark/extracted_summary.txt', 'w', encoding='utf-8') as out:
    for f in files:
        lines = extract_docx(f)
        out.write(f'===================================================\n')
        out.write(f'FILE: {os.path.basename(f)} (Lines: {len(lines)})\n')
        out.write(f'===================================================\n')
        for i, l in enumerate(lines):
            out.write(f'[{i+1}] {l}\n')
        out.write('\n\n')

print("Extraction completed. Saved to Remark/extracted_summary.txt")
