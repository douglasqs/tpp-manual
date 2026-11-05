#!/usr/bin/env python3
"""Refresh the published partner directory from its public Google Sheets CSV."""

import csv
import io
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1LU40xkc-vr6ScDmZ7LA7HSerzbDFH8Ve/export?format=csv"
)
XLSX_URL = CSV_URL.replace("export?format=csv", "export?format=xlsx")
OUTPUT = Path(__file__).resolve().parents[1] / "companies-data.js"


def product_cell_links(xlsx_bytes):
    """Read external hyperlinks from product cells in Google's XLSX export."""
    main_ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    rel_ns = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
    package_rel_ns = "{http://schemas.openxmlformats.org/package/2006/relationships}"

    with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as workbook:
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        relationships = ET.fromstring(workbook.read("xl/worksheets/_rels/sheet1.xml.rels"))

    targets = {
        relation.attrib["Id"]: relation.attrib["Target"]
        for relation in relationships.findall(f"{package_rel_ns}Relationship")
        if relation.attrib.get("TargetMode") == "External"
    }
    links = {}
    for item in sheet.findall(f".//{main_ns}hyperlink"):
        reference = item.attrib.get("ref", "")
        match = re.fullmatch(r"F(\d+)", reference)
        target = targets.get(item.attrib.get(f"{rel_ns}id", ""), "")
        if match and target.startswith("https://"):
            links[int(match.group(1))] = target
    return links


def main():
    request = urllib.request.Request(
        CSV_URL,
        headers={"User-Agent": "tpp-manual-company-directory/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        content = response.read().decode("utf-8-sig")
    with urllib.request.urlopen(XLSX_URL, timeout=30) as response:
        product_links = product_cell_links(response.read())

    reader = csv.DictReader(io.StringIO(content, newline=""))
    required = {"NOME FANTASIA", "RAZÃO SOCIAL corrigido", "INTEGRAÇÃO", "PORTAL TPP", "PRODUTOS"}
    if not reader.fieldnames or not required.issubset(reader.fieldnames):
        raise ValueError("CSV headers did not match the expected company sheet columns")

    companies = []
    for row_number, row in enumerate(reader, start=2):
        if (row.get("INTEGRAÇÃO") or "").strip().upper() != "SIM":
            continue
        name = (row.get("NOME FANTASIA") or "").strip()
        if not name:
            continue
        product_url = product_links.get(row_number)
        products = []
        for item in (row.get("PRODUTOS") or "").splitlines():
            item = item.strip()
            if item:
                products.append({"name": item, **({"url": product_url} if product_url else {})})
        companies.append(
            {
                "name": name,
                "legalName": (row.get("RAZÃO SOCIAL corrigido") or "").strip(),
                "integration": (row.get("INTEGRAÇÃO") or "").strip(),
                "portal": (row.get("PORTAL TPP") or "").strip(),
                "products": products,
            }
        )

    if not companies:
        raise ValueError("CSV contained no companies marked with integration SIM; keeping current data")

    companies.sort(key=lambda company: company["name"].casefold())
    serialized = json.dumps(companies, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(f"window.integratedCompanies = {serialized};\n", encoding="utf-8")
    print(f"Updated {OUTPUT.name} with {len(companies)} companies marked SIM")


if __name__ == "__main__":
    main()
