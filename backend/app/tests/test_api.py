from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "database" in response.json()

def test_kpi_summary():
    response = client.get("/api/kpi/summary?year=2024")
    # It might return 200 or 404 if data doesn't exist.
    # We will just assert it's a valid JSON response from our app
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert "gross_revenue" in data
        assert "net_profit" in data

def test_sales_monthly():
    response = client.get("/api/sales/monthly")
    assert response.status_code == 200
    assert "data" in response.json()
    assert isinstance(response.json()["data"], list)

def test_expenses_categories():
    response = client.get("/api/expenses/categories")
    assert response.status_code == 200
    assert "data" in response.json()
    assert isinstance(response.json()["data"], list)

def test_stock_summary():
    response = client.get("/api/stock/summary")
    assert response.status_code == 200
    assert "total_qty_sisa" in response.json()

def test_low_stock():
    response = client.get("/api/stock/low-stock?threshold=5")
    assert response.status_code == 200
    assert response.json()["threshold_used"] == 5
    assert "data" in response.json()
