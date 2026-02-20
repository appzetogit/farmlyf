import fetch from 'node-fetch';

async function testUpdate() {
  const API_URL = 'http://localhost:5000/api';
  
  // 1. Get all orders
  const res = await fetch(`${API_URL}/orders`);
  const orders = await res.json();
  
  if (orders.length === 0) {
    console.log("No orders to test with");
    return;
  }
  
  const testOrder = orders[0];
  console.log(`Testing with order: ${testOrder.id} (Status: ${testOrder.status})`);
  
  // 2. Update status
  const updateRes = await fetch(`${API_URL}/orders/${testOrder.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      status: 'Shipped',
      deliveryStatus: 'Shipped',
      awbCode: 'TESTAWB123',
      courierName: 'Delhivery'
    })
  });
  
  if (updateRes.ok) {
    const updated = await updateRes.json();
    console.log("Update success!");
    console.log("New Status:", updated.status);
    console.log("New AWB:", updated.awbCode);
  } else {
    console.log("Update failed:", await updateRes.text());
  }
}

testUpdate();
