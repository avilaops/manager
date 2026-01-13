#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

def capitalize_name(name):
    """
    Converte nome para: primeira letra maiúscula, resto minúscula
    Ex: "JOÃO SILVA" -> "João silva"
    """
    if not name:
        return name
    
    # Converte para minúscula e depois capitaliza apenas a primeira letra
    return name.strip().lower().capitalize()

def parse_and_normalize_vcard(text):
    """
    Processa um bloco vCard e normaliza o nome
    """
    lines = text.strip().split('\n')
    output_lines = []
    
    for line in lines:
        if line.startswith('FN'):
            # Extrai o nome
            if ':' in line:
                parts = line.split(':', 1)
                prefix = parts[0]
                name = parts[1].strip()
                
                # Normaliza o nome
                normalized_name = capitalize_name(name)
                
                # Reconstrói a linha
                output_lines.append(f"{prefix}:{normalized_name}")
            else:
                output_lines.append(line)
        elif line.startswith('N') and not line.startswith('NOTE'):
            # Trata o campo N (pode ter encoding)
            if 'QUOTED-PRINTABLE' in line or 'CHARSET' in line:
                # Mantém como está se tem encoding especial
                output_lines.append(line)
            elif ':' in line:
                # Campo N simples - normaliza o primeiro componente
                parts = line.split(':', 1)
                prefix = parts[0]
                content = parts[1].strip()
                
                # O campo N tem formato: LastName;FirstName;MiddleName;;
                # Normaliza cada parte
                components = content.split(';')
                normalized_components = [capitalize_name(c) if c else '' for c in components]
                normalized_content = ';'.join(normalized_components)
                
                output_lines.append(f"{prefix}:{normalized_content}")
            else:
                output_lines.append(line)
        else:
            output_lines.append(line)
    
    return '\n'.join(output_lines) + '\n'

def normalize_contact_names(input_file, output_file):
    """
    Normaliza os nomes de todos os contatos
    """
    
    # Lê o arquivo
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Divide em blocos vCard
    vcard_blocks = re.split(r'(?=BEGIN:VCARD)', content)
    vcard_blocks = [v for v in vcard_blocks if v.strip()]
    
    print(f"Processando {len(vcard_blocks)} contatos...")
    
    # Processa cada vCard
    normalized_blocks = []
    for i, block in enumerate(vcard_blocks, 1):
        normalized = parse_and_normalize_vcard(block)
        normalized_blocks.append(normalized)
        
        if i % 1000 == 0:
            print(f"  ✓ {i} contatos processados...")
    
    # Escreve arquivo normalizado
    with open(output_file, 'w', encoding='utf-8') as f:
        for block in normalized_blocks:
            f.write(block)
    
    print(f"\n✓ Concluído!")
    print(f"  - Total de contatos normalizados: {len(normalized_blocks)}")
    print(f"  - Arquivo salvo: {output_file}")
    
    return len(normalized_blocks)

# Executa
if __name__ == '__main__':
    input_file = r'd:\Gerenciador-pessoal\contacts\contatos_unicos.vcf'
    output_file = r'd:\Gerenciador-pessoal\contacts\contatos_padronizados.vcf'
    
    normalize_contact_names(input_file, output_file)
