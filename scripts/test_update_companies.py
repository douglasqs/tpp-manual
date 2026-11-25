import csv
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import update_companies


class CompanyDirectoryTests(unittest.TestCase):
    def sheet(self, legal_header="RAZÃO SOCIAL", integration_header="INTEGRAÇÃO", status="SIM"):
        content = io.StringIO(newline="")
        writer = csv.writer(content)
        writer.writerow(["NOME FANTASIA", legal_header, integration_header, "PORTAL TPP", "CONTATO", "PRODUTOS"])
        writer.writerow(["Ignorada", "Outra Ltda", "NÃO", "SIM", "", ""])
        writer.writerow([" Parceira ", " Parceira Ltda ", status, "SIM", "", "Modelo A\nModelo B"])
        return content.getvalue()

    def test_current_and_legacy_headers_preserve_products_and_row_links(self):
        for header in ("RAZÃO SOCIAL", "RAZÃO SOCIAL corrigido", "  razão   social  "):
            with self.subTest(header=header):
                companies = update_companies.parse_companies(self.sheet(header), {3: "https://example.com/models"})
                self.assertEqual(companies, [{
                    "name": "Parceira", "legalName": "Parceira Ltda", "integration": "SIM", "portal": "SIM",
                    "products": [
                        {"name": "Modelo A", "url": "https://example.com/models"},
                        {"name": "Modelo B", "url": "https://example.com/models"},
                    ],
                }])

    def test_missing_required_column_reports_received_headers(self):
        with self.assertRaisesRegex(ValueError, "INTEGRAÇÃO.*received headers"):
            update_companies.parse_companies(self.sheet(integration_header="OUTRA COLUNA"), {})

    def test_invalid_or_empty_sheet_keeps_published_file(self):
        for content in (self.sheet(integration_header="OUTRA COLUNA"), self.sheet(status="NÃO"), ""):
            with self.subTest(content=content), tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / "companies-data.js"
                output.write_text("original", encoding="utf-8")
                response = io.BytesIO(content.encode("utf-8"))
                with patch.object(update_companies, "OUTPUT", output), \
                     patch.object(update_companies.urllib.request, "urlopen", side_effect=[response, io.BytesIO()]), \
                     patch.object(update_companies, "product_cell_links", return_value={}):
                    with self.assertRaises(ValueError):
                        update_companies.main()
                self.assertEqual(output.read_text(encoding="utf-8"), "original")


if __name__ == "__main__":
    unittest.main()
