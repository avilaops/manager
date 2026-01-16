#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path

def normalize_for_comparison(text):
    """
    Normaliza texto para comparação (remove espaços, acentos, converte para minúscula)
    """
    if not text:
        return ""
    # Remove espaços extras
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def extract_phone_normalized(phone_str):
    """
    Extrai apenas dígitos do telefone para comparação
    """
    if not phone_str:
        return ""
    # Remove tudo que não é dígito
    return re.sub(r'\D', '', phone_str)

def parse_vcard_block(text):
    """
    Analisa um bloco vCard e retorna um dicionário
    """
    vcard = {
        'fn': None,
        'name': None,
        'tel': None,
        'fn_normalized': None,
        'tel_normalized': None,
        'full_text': text,
        'duplicated': False
    }
    
    lines = text.strip().split('\n')
    
    for line in lines:
        if line.startswith('FN'):
            # Extrai FN mesmo com encoding
            match = re.search(r':(.+)$', line)
            if match:
                vcard['fn'] = match.group(1).strip()
                vcard['fn_normalized'] = normalize_for_comparison(vcard['fn'])
        elif line.startswith('TEL'):
            # Extrai telefone
            match = re.search(r':([^:]+)$', line)
            if match:
                phone = match.group(1).strip()
                vcard['tel'] = phone
                vcard['tel_normalized'] = extract_phone_normalized(phone)
    
    return vcard

def remove_duplicates(input_file, output_file):
    """
    Remove contatos duplicados do arquivo VCF
    """
    
    # Lê o arquivo
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Divide em blocos vCard
    vcard_blocks = re.split(r'(?=BEGIN:VCARD)', content)
    vcard_blocks = [v for v in vcard_blocks if v.strip()]
    
    # Processa cada vCard
    parsed_vcards = []
    for block in vcard_blocks:
        parsed = parse_vcard_block(block)
        parsed_vcards.append(parsed)
    
    print(f"Total de contatos antes de remover duplicatas: {len(parsed_vcards)}")
    
    # Detecta duplicatas
    seen_names = {}
    seen_phones = {}
    unique_vcards = []
    duplicates_removed = 0
    
    for vcard in parsed_vcards:
        is_duplicate = False
        reason = None
        
        # Verifica por nome duplicado
        if vcard['fn_normalized']:
            if vcard['fn_normalized'] in seen_names:
                is_duplicate = True
                reason = f"Nome duplicado: {vcard['fn']}"
                duplicates_removed += 1
            else:
                seen_names[vcard['fn_normalized']] = True
        
        # Verifica por telefone duplicado
        if vcard['tel_normalized'] and not is_duplicate:
            if vcard['tel_normalized'] in seen_phones:
                is_duplicate = True
                reason = f"Telefone duplicado: {vcard['tel']}"
                duplicates_removed += 1
            else:
                seen_phones[vcard['tel_normalized']] = True
        
        if not is_duplicate:
            unique_vcards.append(vcard)
        else:
            if reason:
                print(f"  ✗ Removido: {reason}")
    
    # Escreve arquivo sem duplicatas
    with open(output_file, 'w', encoding='utf-8') as f:
        for vcard in unique_vcards:
            f.write(vcard['full_text'])
            # Garante quebra de linha entre vcards
            if not vcard['full_text'].endswith('\n'):
                f.write('\n')
    
    print(f"\n✓ Resultado final:")
    print(f"  - Contatos únicos: {len(unique_vcards)}")
    print(f"  - Duplicatas removidas: {duplicates_removed}")
    print(f"  - Arquivo salvo: {output_file}")
    
    return len(unique_vcards), duplicates_removed

# Executa
if __name__ == '__main__':
    input_file = r'd:\Gerenciador-pessoal\contacts\contatos_mesclados.vcf'
    output_file = r'd:\Gerenciador-pessoal\contacts\contatos_unicos.vcf'
    
    unique_count, removed_count = remove_duplicates(input_file, output_file)
