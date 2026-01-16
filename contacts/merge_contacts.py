#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path

def normalize_phone(phone_str):
    """
    Normaliza números de telefone para formato internacional +55
    """
    if not phone_str:
        return None
    
    # Remove caracteres especiais mantendo apenas dígitos
    digits = re.sub(r'\D', '', phone_str)
    
    # Se já tem código de país
    if digits.startswith('55'):
        return f"+55 {digits[2:7]}-{digits[7:]}"
    
    # Se tem 11 dígitos (número completo sem código)
    if len(digits) == 11:
        return f"+55 {digits[0:2]} {digits[2:7]}-{digits[7:]}"
    
    # Se tem 10 dígitos (fixo)
    if len(digits) == 10:
        return f"+55 {digits[0:2]} {digits[2:6]}-{digits[6:]}"
    
    # Se tem 8-9 dígitos (número parcial)
    if 8 <= len(digits) <= 9:
        if len(digits) == 8:
            return f"+55 {digits[0:4]}-{digits[4:]}"
        else:
            return f"+55 {digits[0:5]}-{digits[5:]}"
    
    # Padrão geral: +55 + resto
    if len(digits) > 0:
        return f"+55 {digits}"
    
    return None

def extract_phone_from_vcard_line(line):
    """
    Extrai o número de telefone de uma linha TEL do vCard
    """
    # Procura pelo valor após o último ':'
    match = re.search(r':([^:]+)$', line)
    if match:
        return match.group(1).strip()
    return None

def parse_vcard(text):
    """
    Analisa um bloco vCard e retorna um dicionário com os dados
    """
    vcard = {
        'name': None,
        'fn': None,
        'tel': None,
        'original_tel': None,
        'version': None
    }
    
    lines = text.strip().split('\n')
    
    for line in lines:
        if line.startswith('VERSION:'):
            vcard['version'] = line.split(':', 1)[1].strip()
        elif line.startswith('FN'):
            # Parse FN com possível encoding
            if 'QUOTED-PRINTABLE' in line:
                match = re.search(r':(.+)$', line)
                if match:
                    vcard['fn'] = match.group(1).strip()
            else:
                vcard['fn'] = line.split(':', 1)[1].strip() if ':' in line else None
        elif line.startswith('N'):
            # Parse N com possível encoding
            if 'QUOTED-PRINTABLE' in line:
                match = re.search(r':(.+)$', line)
                if match:
                    vcard['name'] = match.group(1).strip()
            else:
                vcard['name'] = line.split(':', 1)[1].strip() if ':' in line else None
        elif line.startswith('TEL'):
            phone = extract_phone_from_vcard_line(line)
            if phone:
                vcard['original_tel'] = phone
                vcard['tel'] = normalize_phone(phone)
    
    return vcard

def create_normalized_vcard(vcard, index):
    """
    Cria uma nova entrada vCard normalizada
    """
    output = "BEGIN:VCARD\n"
    output += "VERSION:3.0\n"
    
    if vcard['fn']:
        output += f"FN:{vcard['fn']}\n"
    
    if vcard['name']:
        output += f"N:{vcard['name']}\n"
    
    if vcard['tel']:
        # Remove espaços extras para o TEL
        tel_clean = vcard['tel'].replace(' ', '')
        output += f"TEL;type=CELL;type=VOICE:{vcard['tel']}\n"
    
    output += "END:VCARD\n"
    
    return output

def merge_and_normalize_contacts(file1, file2, output_file):
    """
    Mescla dois arquivos VCF e normaliza os números
    """
    
    # Lê os arquivos
    with open(file1, 'r', encoding='utf-8') as f:
        content1 = f.read()
    
    with open(file2, 'r', encoding='utf-8') as f:
        content2 = f.read()
    
    # Divide em blocos vCard
    vcards1 = re.split(r'(?=BEGIN:VCARD)', content1)
    vcards2 = re.split(r'(?=BEGIN:VCARD)', content2)
    
    all_vcards = [v for v in vcards1 if v.strip()] + [v for v in vcards2 if v.strip()]
    
    # Processa cada vCard
    parsed_vcards = []
    seen = set()  # Para evitar duplicatas
    
    for vcard_text in all_vcards:
        parsed = parse_vcard(vcard_text)
        
        # Cria chave única
        key = (parsed['fn'] or '', parsed['original_tel'] or '')
        
        if key not in seen and (parsed['fn'] or parsed['tel']):
            seen.add(key)
            parsed_vcards.append(parsed)
    
    # Escreve arquivo normalizado
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, vcard in enumerate(parsed_vcards, 1):
            if vcard['fn'] or vcard['tel']:
                normalized = create_normalized_vcard(vcard, i)
                f.write(normalized)
    
    return len(parsed_vcards)

# Executa
if __name__ == '__main__':
    file1 = r'd:\Gerenciador-pessoal\contacts\contacts.vcf'
    file2 = r'd:\Gerenciador-pessoal\contacts\contatos-nicolas.vcf'
    output = r'd:\Gerenciador-pessoal\contacts\contatos_mesclados.vcf'
    
    count = merge_and_normalize_contacts(file1, file2, output)
    
    print(f"✓ Sucesso! {count} contatos processados")
    print(f"✓ Arquivo criado: {output}")
