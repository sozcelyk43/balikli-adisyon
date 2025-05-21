// server.js
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');
const { Pool } = require('pg');

const HTTP_PORT = process.env.PORT || 8080;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
    .then(() => console.log('PostgreSQL veritabanına başarıyla bağlandı! (sales_log ve activity_log için)'))
    .catch(err => {
        console.error('!!! VERİTABANI BAĞLANTI HATASI !!!:', err.stack);
    });

const app = express();
const httpServer = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'adisyon.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("HTML dosyası gönderilirken hata:", err);
            if (!res.headersSent) {
                 res.status(err.status || 500).send("Adisyon dosyası yüklenemedi.");
            }
        }
    });
});

// menu.html için GET route (isteğe bağlı, eğer kullanıyorsanız)
app.get('/menu', (req, res) => {
    const menuFilePath = path.join(__dirname, 'public', 'menu.html');
    res.sendFile(menuFilePath, (err) => {
        if (err) {
            console.error("Menü dosyası gönderilirken hata:", err);
             if (!res.headersSent) {
                 res.status(err.status || 500).send("Menü dosyası yüklenemedi.");
            }
        }
    });
});

const wss = new WebSocket.Server({ server: httpServer });

console.log(`BALIKLI LEZZET GÜNLERİ ADİSYON HTTP Sunucusu ${HTTP_PORT} portunda başlatıldı.`);
console.log(`WebSocket sunucusu da bu HTTP sunucusu üzerinden çalışıyor.`);

// Kullanıcılar aynı kalacak
let users = [
    { id: 1, username: 'hamza', password: 'ham.za', role: 'cashier' }, { id: 2, username: 'bilal', password: 'bil.al', role: 'cashier' },
    { id: 10, username: 'sinan', password: 'sinan12', role: 'cashier' }, { id: 3, username: 'aykut', password: 'ay.kut', role: 'waiter' },
    { id: 4, username: 'osman', password: 'os.man', role: 'waiter' }, { id: 5, username: 'omerfaruk', password: 'omer.faruk', role: 'waiter' },
    { id: 6, username: 'zeynel', password: 'zey.nel', role: 'waiter' }, { id: 7, username: 'dursunali', password: 'd.ali', role: 'waiter' },
    { id: 8, username: 'tevfik', password: 'tev.fik', role: 'waiter' }, { id: 9, username: 'garson', password: 'gar.son', role: 'waiter' },
    { id: 20, username: 'mutfak', password: 'mut.fak', role: 'kitchen' }
];

// Ürünler aynı kalacak
let currentProductId = 1000;
let products = [
    { id: ++currentProductId, name: "İSKENDER - 120 GR", price: 275.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "ET DÖNER EKMEK ARASI", price: 150.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "ET DÖNER PORSİYON", price: 175.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "TAVUK DÖNER EKMEK ARASI", price: 130.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "TAVUK DÖNER PORSİYON", price: 150.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "KÖFTE EKMEK", price: 130.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "KÖFTE PORSİYON", price: 150.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "KUZU ŞİŞ", price: 150.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "ADANA ŞİŞ", price: 150.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "PİRZOLA - 4 ADET", price: 250.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "TAVUK FAJİTA", price: 200.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "TAVUK (PİLİÇ) ÇEVİRME", price: 250.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "ET DÖNER - KG", price: 1300.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "ET DÖNER - 500 GR", price: 650.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "TAVUK DÖNER - KG", price: 800.00, category: "ET - TAVUK" }, { id: ++currentProductId, name: "TAVUK DÖNER - 500 GR", price: 400.00, category: "ET - TAVUK" },
    { id: ++currentProductId, name: "AYVALIK TOSTU", price: 120.00, category: "ATIŞTIRMALIK" }, { id: ++currentProductId, name: "HAMBURGER", price: 150.00, category: "ATIŞTIRMALIK" },
    { id: ++currentProductId, name: "BALIK BURGER", price: 150.00, category: "ATIŞTIRMALIK" }, { id: ++currentProductId, name: "PİDE ÇEŞİTLERİ", price: 120.00, category: "ATIŞTIRMALIK" },
    { id: ++currentProductId, name: "PİZZA KARIŞIK (ORTA BOY)", price: 150.00, category: "ATIŞTIRMALIK" }, { id: ++currentProductId, name: "PİZZA KARIŞIK (BÜYÜK BOY)", price: 200.00, category: "ATIŞTIRMALIK" },
    { id: ++currentProductId, name: "LAHMACUN", price: 75.00, category: "ATIŞTIRMALIK" }, { id: ++currentProductId, name: "ÇİĞ KÖFTE - KG (MARUL-LİMON)", price: 300.00, category: "ATIŞTIRMALIK" },
    { id: ++currentProductId, name: "YAĞLI GÖZLEME", price: 50.00, category: "ATIŞTIRMALIK" }, { id: ++currentProductId, name: "İÇLİ GÖZLEME", price: 60.00, category: "ATIŞTIRMALIK" },
    { id: ++currentProductId, name: "OSMANLI ŞERBETİ - 1 LT", price: 75.00, category: "İÇECEK" }, { id: ++currentProductId, name: "LİMONATA - 1 LT", price: 75.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "AYRAN", price: 10.00, category: "İÇECEK" }, { id: ++currentProductId, name: "SU", price: 10.00, category: "İÇECEK" }, { id: ++currentProductId, name: "ÇAY", price: 10.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "SOĞUK ÇAY ÇEŞİTLERİ", price: 25.00, category: "İÇECEK" }, { id: ++currentProductId, name: "TAMEK MEYVE SUYU", price: 25.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "MEYVELİ MADEN SUYU", price: 25.00, category: "İÇECEK" }, { id: ++currentProductId, name: "NİĞDE GAZOZU", price: 25.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "ŞALGAM", price: 25.00, category: "İÇECEK" }, { id: ++currentProductId, name: "SADE MADEN SUYU", price: 15.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "TROPİKAL - ÇİLEK KOKUSU", price: 75.00, category: "İÇECEK" }, { id: ++currentProductId, name: "TROPİKAL - KAVUNEZYA", price: 75.00, category: "İÇECEK" }, { id: ++currentProductId, name: "TROPİKAL - NAR-I ŞAHANE", price: 75.00, category: "İÇECEK" },
    { id: ++currentProductId, name: "EV BAKLAVASI - KG", price: 400.00, category: "TATLI" }, { id: ++currentProductId, name: "EV BAKLAVASI - 500 GR", price: 200.00, category: "TATLI" },
    { id: ++currentProductId, name: "EV BAKLAVASI - PORSİYON", price: 75.00, category: "TATLI" }, { id: ++currentProductId, name: "AŞURE - 500 GRAM", price: 100.00, category: "TATLI" },
    { id: ++currentProductId, name: "HÖŞMERİM - 500 GR", price: 100.00, category: "TATLI" }, { id: ++currentProductId, name: "WAFFLE", price: 150.00, category: "TATLI" },
    { id: ++currentProductId, name: "DİĞER PASTA ÇEŞİTLERİ", price: 50.00, category: "TATLI" }, { id: ++currentProductId, name: "KELLE PAÇA ÇORBA", price: 60.00, category: "ÇORBA" },
    { id: ++currentProductId, name: "TARHANA ÇORBA", price: 50.00, category: "ÇORBA" }
];
let nextProductId = currentProductId + 1;
let tables = [];
let nextTableIdCounter = 1; // Bu, initializeTables içinde ayarlanacak
let activeQuickSalesForKDS = {}; // KDS için aktif hızlı satışları tutar

// Masaların başlatılması güncellendi
function initializeTables() {
    tables = [];
    let currentId = 1;
    for (let i = 1; i <= 16; i++) {
        tables.push({
            id: `masa-${currentId++}`,
            name: `MASA ${i}`,
            type: 'standart', // Yeni HTML'deki KDS map'i için tip bilgisi gerekebilir
            status: "boş",
            order: [],
            total: 0,
            waiterId: null,
            waiterUsername: null,
            customerNameOnTable: null,
            kitchen_status: null, // Mutfak durumu (new_order, preparing, ready, acknowledged)
            last_order_timestamp: 0 // Son siparişin zaman damgası (KDS sıralaması için)
        });
    }
    nextTableIdCounter = currentId; // Bir sonraki eklenecek masa için ID sayacını ayarla
}
initializeTables();

const clients = new Map();

// Broadcast fonksiyonları aynı kalacak
function broadcast(message) { const messageString = JSON.stringify(message); clients.forEach((userInfo, clientSocket) => { if (clientSocket.readyState === WebSocket.OPEN) { try { clientSocket.send(messageString); } catch (error) { console.error("Broadcast hatası:", error); clients.delete(clientSocket); } } }); }
function broadcastToKitchen(message) { const messageString = JSON.stringify(message); clients.forEach((userInfo, clientSocket) => { if (userInfo && userInfo.role === 'kitchen' && clientSocket.readyState === WebSocket.OPEN) { try { clientSocket.send(messageString); } catch (error) { console.error("Mutfak broadcast hatası:", error); clients.delete(clientSocket); } } });}
function broadcastToCashiers(message) { const messageString = JSON.stringify(message); clients.forEach((userInfo, clientSocket) => { if (userInfo && userInfo.role === 'cashier' && clientSocket.readyState === WebSocket.OPEN) { try { clientSocket.send(messageString); } catch (error) { console.error("Kasiyer broadcast hatası:", error); clients.delete(clientSocket); } } });}
function broadcastTableUpdates() { const tablesCopy = tables.map(t => ({...t, order: t.order.map(o => ({...o})) })); broadcast({ type: 'tables_update', payload: { tables: tablesCopy } }); }
function fetchProductsFromDB() { return products.slice(); /* Şimdilik hafızadan, ileride DB'den çekilebilir */ }
async function broadcastProductsUpdate() { broadcast({ type: 'products_update', payload: { products: fetchProductsFromDB() } });}
function broadcastWaitersList(requestingWs) { const waiters = users.filter(u => u.role === 'waiter').map(u => ({ id: u.id, username: u.username })); const msg = { type: 'waiters_list', payload: { waiters: waiters } }; if (requestingWs && requestingWs.readyState === WebSocket.OPEN) { try {requestingWs.send(JSON.stringify(msg));} catch(e){console.error("İstek yapan garson listesi gönderme hatası:",e);} } else { clients.forEach((userInfo, clientSocket) => { if (userInfo && userInfo.role === 'cashier' && clientSocket.readyState === WebSocket.OPEN) { try { clientSocket.send(JSON.stringify(msg)); } catch (e) {console.error("Kasiyerlere garson listesi gönderme hatası:", e);} } }); } }
function calculateTableTotal(order) { return order.reduce((sum, item) => sum + ((parseFloat(item.priceAtOrder) || 0) * (parseInt(item.quantity, 10) || 0)), 0); }
function getClientIp(ws, req) { try { const ff = req?.headers['x-forwarded-for']; if (ff) return Array.isArray(ff) ? ff[0].split(',')[0].trim() : ff.split(',')[0].trim(); return ws._socket?.remoteAddress || req?.socket?.remoteAddress || null; } catch (e) { console.error("IP adresi alınırken hata:", e); return null; } }
async function logActivity(username, actionType, details = {}, targetEntity = null, targetEntityId = null, ipAddress = null) { const clientDB = await pool.connect(); try { await clientDB.query( `INSERT INTO activity_log (user_username, action_type, target_entity, target_entity_id, log_details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)`, [username || 'SISTEM', actionType, targetEntity, targetEntityId ? String(targetEntityId) : null, JSON.stringify(details), ipAddress] ); } catch (error) { console.error('Aktivite Loglama Hatası:', error.stack); } finally { clientDB.release(); } }

// wss.on('connection', ...) bloğu büyük ölçüde aynı kalacak,
// çünkü yeni HTML dosyası da benzer WebSocket mesaj tiplerini kullanıyor.
// Sadece bazı küçük ayarlamalar veya teyitler gerekebilir.

wss.on('connection', (ws, req) => {
    const clientIpAddress = getClientIp(ws, req);
    ws.on('message', async (messageAsString) => {
        let message;
        try {
            message = JSON.parse(messageAsString);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Geçersiz JSON formatı.' } }));
            return;
        }
        const { type, payload } = message;
        let currentUserInfo = clients.get(ws);

        switch (type) {
            case 'login':
                const userToLogin = users.find(u => u.username === payload.username && u.password === payload.password);
                if (userToLogin) {
                    // Aynı ID ile başka bir client varsa sonlandır
                    for (let [client, info] of clients.entries()) {
                        if (info.id === userToLogin.id && client !== ws) {
                            client.terminate(); // Eski bağlantıyı sonlandır
                            clients.delete(client); // Map'ten sil
                        }
                    }
                    clients.set(ws, { id: userToLogin.id, username: userToLogin.username, role: userToLogin.role, ip: clientIpAddress });
                    currentUserInfo = clients.get(ws); // Güncel kullanıcı bilgisini al
                    // Login success mesajı, masalar ve ürünlerle birlikte gönderiliyor
                    ws.send(JSON.stringify({
                        type: 'login_success',
                        payload: {
                            user: currentUserInfo,
                            tables: tables, // Güncel masa listesi
                            products: fetchProductsFromDB() // Güncel ürün listesi
                        }
                    }));
                    await logActivity(userToLogin.username, 'KULLANICI_GIRIS', { rol: userToLogin.role }, 'User', userToLogin.id, clientIpAddress);
                } else {
                    ws.send(JSON.stringify({ type: 'login_fail', payload: { error: 'Kullanıcı adı veya şifre hatalı.' } }));
                    await logActivity(payload.username, 'KULLANICI_GIRIS_BASARISIZ', { sebep: 'Hatalı şifre veya kullanıcı adı' }, 'User', null, clientIpAddress);
                }
                break;

            case 'reauthenticate': // Yeni HTML bu mesajı kullanıyor
                 if (payload && payload.user && payload.user.id) {
                     const foundUser = users.find(u => u.id === payload.user.id && u.username === payload.user.username);
                     if (foundUser) {
                         for (let [client, info] of clients.entries()) { if (info.id === foundUser.id && client !== ws) { client.terminate(); clients.delete(client); } }
                         clients.set(ws, { ...payload.user, ip: clientIpAddress }); // payload.user'dan gelen tüm bilgileri al
                         currentUserInfo = clients.get(ws);
                         // Yeniden kimlik doğrulama başarılı olduğunda masaları ve ürünleri gönder
                         ws.send(JSON.stringify({ type: 'tables_update', payload: { tables: tables } }));
                         ws.send(JSON.stringify({ type: 'products_update', payload: { products: fetchProductsFromDB() } }));
                         if (currentUserInfo.role === 'kitchen') { // Eğer mutfak ise KDS siparişlerini de gönder
                            const activeTableOrders = tables.filter(t => (t.isQuickSale || t.status === 'dolu') && t.order && t.order.length > 0 && t.order.some(item => item.kds_status_mutfak !== 'delivered_to_customer')).map(t => ({ id: t.id, name: t.name, waiterUsername: t.waiterUsername, order: t.order.filter(item => item.kds_status_mutfak !== 'delivered_to_customer').map(item => ({ ...item })), kitchen_status: t.kitchen_status, last_order_timestamp: t.last_order_timestamp, customerNameOnTable: t.customerNameOnTable, isQuickSale: t.isQuickSale || false }));
                            const activeQuickSaleOrdersForKds = Object.values(activeQuickSalesForKDS).filter(qs => qs.order && qs.order.length > 0 && qs.order.some(item => item.kds_status_mutfak !== 'delivered_to_customer'));
                            const allKdsOrders = [...activeTableOrders, ...activeQuickSaleOrdersForKds];
                            ws.send(JSON.stringify({ type: 'kds_initial_orders', payload: { activeOrders: allKdsOrders, allTables: tables.map(t=>({id: t.id, name: t.name, type: t.type})) } }));
                         }
                     } else {
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Geçersiz oturum bilgisi (reauth fail).' } }));
                        clients.delete(ws); // Geçersiz oturum, client'ı haritadan çıkar
                     }
                 } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Eksik oturum bilgisi (reauth).' } }));
                    clients.delete(ws); // Eksik bilgi, client'ı haritadan çıkar
                 }
                break;

            case 'get_products': // Bu hala kullanılabilir
                try {
                    ws.send(JSON.stringify({ type: 'products_update', payload: { products: fetchProductsFromDB() } }));
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Ürünler getirilirken bir sorun oluştu.' } }));
                }
                break;

            case 'get_users': // Kullanıcı listesi için (admin/cashier)
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                    return;
                }
                ws.send(JSON.stringify({ type: 'users_list', payload: { users: users.map(u => ({id: u.id, username: u.username, role: u.role})) } }));
                break;

            case 'add_order_item':
                if (!currentUserInfo) { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için giriş yapmalısınız.' } })); return; }
                const tableToAdd = tables.find(t => t.id === payload.tableId);
                const productInfo = products.find(p => p.id === parseInt(payload.productId));

                if (tableToAdd && productInfo && typeof payload.quantity === 'number' && payload.quantity > 0) {
                    // KG satışı ve normal ürün ekleme mantığı (yeni HTML'e göre uyarlanmış)
                    const isKgSale = payload.isKgSale || false;
                    const grams = payload.grams || null;
                    const priceAtOrderOverwrite = payload.priceAtOrderOverwrite !== null && payload.priceAtOrderOverwrite !== undefined ? payload.priceAtOrderOverwrite : null;
                    const nameOverwrite = payload.nameOverwrite || null;

                    // Eğer KG satışı değilse ve aynı ürün (açıklama ve fiyatla) zaten varsa adedi artır
                    const existingItem = !isKgSale ? tableToAdd.order.find(
                        item => item.productId === productInfo.id &&
                                item.description === (payload.description || '') &&
                                !item.isKgSale && // Sadece KG olmayanları grupla
                                (priceAtOrderOverwrite === null ? item.priceAtOrder === productInfo.price : item.priceAtOrder === priceAtOrderOverwrite) // Fiyatı da kontrol et
                    ) : null;

                    if (existingItem && !isKgSale) {
                        existingItem.quantity += payload.quantity;
                        existingItem.timestamp = Date.now();
                        existingItem.waiterUsername = currentUserInfo.username; // Siparişi güncelleyen garson
                        existingItem.kds_status_mutfak = 'new'; // Tekrar yeni olarak işaretle
                    } else {
                        const kds_item_unique_id = 'kds_item_' + Date.now() + '_' + Math.random().toString(16).slice(2);
                        const newOrderItemData = {
                            kds_item_id: kds_item_unique_id,
                            productId: productInfo.id,
                            name: nameOverwrite || productInfo.name,
                            category: productInfo.category,
                            quantity: payload.quantity,
                            priceAtOrder: priceAtOrderOverwrite !== null ? priceAtOrderOverwrite : productInfo.price,
                            description: payload.description || '',
                            waiterUsername: currentUserInfo.username,
                            timestamp: Date.now(),
                            isKgSale: isKgSale,
                            grams: grams,
                            kds_status_mutfak: 'new' // Mutfak için başlangıç durumu
                        };
                        tableToAdd.order.push(newOrderItemData);
                    }

                    tableToAdd.total = calculateTableTotal(tableToAdd.order);
                    tableToAdd.status = 'dolu';
                    if (!tableToAdd.waiterId || currentUserInfo.role === 'waiter' || currentUserInfo.role === 'cashier') {
                        tableToAdd.waiterId = currentUserInfo.id;
                        tableToAdd.waiterUsername = currentUserInfo.username;
                    }
                    if (payload.customerNameOnTable !== undefined) { // Müşteri adı payload'dan gelebilir
                        tableToAdd.customerNameOnTable = payload.customerNameOnTable;
                    }
                    tableToAdd.last_order_timestamp = Date.now(); // KDS sıralaması için
                    tableToAdd.kitchen_status = 'new_order'; // Genel masa mutfak durumu

                    broadcastTableUpdates();
                    await logActivity(currentUserInfo.username, 'SIPARIS_URUN_EKLENDI',
                        { masa: tableToAdd.name, urun_id: productInfo.id, urun_adi: nameOverwrite || productInfo.name, adet: payload.quantity, fiyat: priceAtOrderOverwrite !== null ? priceAtOrderOverwrite : productInfo.price, aciklama: payload.description || '', gram: grams, masa_musteri: tableToAdd.customerNameOnTable },
                        'Order', tableToAdd.id, clientIpAddress);
                } else {
                    ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Geçersiz masa, ürün veya miktar bilgisi.' } }));
                }
                break;
            
            case 'update_table_customer_name': // Yeni HTML bu mesajı kullanıyor
                if (!currentUserInfo) { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Giriş yapın.' } })); return; }
                const tableToUpdateCustomer = tables.find(t => t.id === payload.tableId);
                if (tableToUpdateCustomer) {
                    const oldCustomerName = tableToUpdateCustomer.customerNameOnTable;
                    tableToUpdateCustomer.customerNameOnTable = payload.customerName || null;
                    broadcastTableUpdates();
                    // İstemciye özel bir onay mesajı göndermeye gerek yok, broadcastTableUpdates yeterli.
                    // Ancak istenirse eklenebilir:
                    // ws.send(JSON.stringify({ type: 'table_customer_name_updated', payload: { tableId: payload.tableId, customerName: tableToUpdateCustomer.customerNameOnTable } }));
                    await logActivity(currentUserInfo.username, 'MASA_MUSTERI_ADI_GUNCELLEME', { masa_id: payload.tableId, masa_adi: tableToUpdateCustomer.name, eski_musteri_adi: oldCustomerName, yeni_musteri_adi: tableToUpdateCustomer.customerNameOnTable }, 'Table', payload.tableId, clientIpAddress);
                } else { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Masa bulunamadı.' } })); }
                break;

            case 'add_manual_order_item': // Yeni HTML bu mesajı kullanıyor (Kasiyer için)
                 if (!currentUserInfo || currentUserInfo.role !== 'cashier') {
                     ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                     return;
                 }
                const tableForManual = tables.find(t => t.id === payload.tableId);
                if (tableForManual && payload.name && typeof payload.price === 'number' && payload.price >= 0 && typeof payload.quantity === 'number' && payload.quantity > 0) {
                     const manualItemData = {
                         kds_item_id: 'kds_item_' + Date.now() + '_' + Math.random().toString(16).slice(2), // Benzersiz ID
                         productId: null, // Manuel ürün olduğu için productId null
                         name: payload.name,
                         category: payload.category || 'Diğer', // Kategori payload'dan gelmiyorsa varsayılan
                         quantity: payload.quantity,
                         priceAtOrder: payload.price,
                         description: payload.description || '',
                         waiterUsername: currentUserInfo.username, // Manuel ekleyen kasiyer
                         timestamp: Date.now(),
                         isKgSale: false, // Manuel ürünler için KG satışı varsayılan olarak false
                         grams: null,
                         kds_status_mutfak: 'new' // Mutfak için başlangıç durumu
                     };
                    tableForManual.order.push(manualItemData);
                    tableForManual.total = calculateTableTotal(tableForManual.order);
                    tableForManual.status = 'dolu';
                    // Eğer masada garson yoksa veya manuel ekleyen kasiyer ise garson olarak ata
                    if (!tableForManual.waiterId) {
                        tableForManual.waiterId = currentUserInfo.id;
                        tableForManual.waiterUsername = currentUserInfo.username;
                    }
                    if (payload.customerNameOnTable !== undefined) { // Müşteri adı payload'dan gelebilir
                        tableForManual.customerNameOnTable = payload.customerNameOnTable;
                    }
                    tableForManual.last_order_timestamp = Date.now();
                    tableForManual.kitchen_status = 'new_order';

                    broadcastTableUpdates();
                    await logActivity(currentUserInfo.username, 'SIPARIS_MANUEL_URUN_EKLENDI',
                        { masa: tableForManual.name, urun_adi: payload.name, adet: payload.quantity, fiyat: payload.price, kategori: payload.category || 'Diğer', aciklama: payload.description || '', masa_musteri: tableForManual.customerNameOnTable },
                        'Order', tableForManual.id, clientIpAddress);
                } else {
                    ws.send(JSON.stringify({ type: 'manual_order_update_fail', payload: { error: 'Geçersiz manuel ürün bilgileri.' } }));
                }
                break;

            case 'remove_order_item': // Yeni HTML'de kullanılıyor (kds_item_id ile)
                if (!currentUserInfo) { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Giriş yapmalısınız.' } })); return; }
                const tableToRemoveFrom = tables.find(t => t.id === payload.tableId);
                if (tableToRemoveFrom && payload.kds_item_id_to_remove) {
                    const itemIndex = tableToRemoveFrom.order.findIndex(item => item.kds_item_id === payload.kds_item_id_to_remove);
                    if (itemIndex > -1) {
                        // Silmeden önce kasiyer/garson yetki kontrolü (örneğin, sadece belirli bir süre içinde veya mutfak durumu 'new' ise) eklenebilir.
                        // Mevcut HTML'de bu kontrol istemci tarafında yapılıyor gibi duruyor.
                        const removedItemDetails = { ...tableToRemoveFrom.order[itemIndex] }; // Loglama için
                        tableToRemoveFrom.order.splice(itemIndex, 1);
                        tableToRemoveFrom.total = calculateTableTotal(tableToRemoveFrom.order);

                        if (tableToRemoveFrom.order.length === 0) { // Masa boşaldıysa
                            tableToRemoveFrom.status = 'boş';
                            tableToRemoveFrom.waiterId = null;
                            tableToRemoveFrom.waiterUsername = null;
                            tableToRemoveFrom.customerNameOnTable = null;
                            tableToRemoveFrom.kitchen_status = null;
                            tableToRemoveFrom.last_order_timestamp = 0;
                        } else { // Masada hala ürün varsa mutfak durumunu güncelle
                            const hasNew = tableToRemoveFrom.order.some(it => it.kds_status_mutfak === 'new');
                            const hasPreparing = tableToRemoveFrom.order.some(it => it.kds_status_mutfak === 'preparing');
                            const allReadyOrDelivered = tableToRemoveFrom.order.every(it => it.kds_status_mutfak === 'ready' || it.kds_status_mutfak === 'delivered_to_customer');
                            const hasAnyReady = tableToRemoveFrom.order.some(it => it.kds_status_mutfak === 'ready');

                            if (allReadyOrDelivered && hasAnyReady) tableToRemoveFrom.kitchen_status = 'ready';
                            else if (hasPreparing) tableToRemoveFrom.kitchen_status = 'preparing';
                            else if (hasNew) tableToRemoveFrom.kitchen_status = 'new_order';
                            else if (tableToRemoveFrom.order.every(it => it.kds_status_mutfak === 'delivered_to_customer')) tableToRemoveFrom.kitchen_status = 'acknowledged'; // Hepsi teslim edildi
                            else tableToRemoveFrom.kitchen_status = 'acknowledged'; // Varsayılan veya mutfak için aktif ürün kalmadı
                        }
                        broadcastTableUpdates();
                        await logActivity(currentUserInfo.username, 'SIPARIS_URUN_SILINDI',
                            { masa: tableToRemoveFrom.name, silinen_urun: removedItemDetails },
                            'Order', tableToRemoveFrom.id, clientIpAddress);
                    } else {
                        ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Sipariş öğesi (KDS ID ile) bulunamadı.' } }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'order_update_fail', payload: { error: 'Masa bulunamadı veya ürün KDS ID bilgisi eksik.' } }));
                }
                break;

            case 'close_table': // Yeni HTML'de kullanılıyor (Kasiyer için)
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                    return;
                }
                const tableToClose = tables.find(t => t.id === payload.tableId);
                if (tableToClose && tableToClose.order && tableToClose.order.length > 0) {
                    const closingTime = new Date();
                    const clientDB = await pool.connect();
                    try {
                        await clientDB.query('BEGIN');
                        // Yeni HTML'de indirim bilgisi payload'da gelmiyor, bu yüzden tableToClose.total kullanılır.
                        // Eğer indirimli tutar loglanacaksa, istemcinin bunu payload ile göndermesi gerekir.
                        // Şimdilik, her bir item'ın o anki fiyatı ve adediyle satış logu oluşturuluyor.
                        for (const item of tableToClose.order) {
                            const totalItemPrice = (parseFloat(item.priceAtOrder) || 0) * (parseInt(item.quantity, 10) || 0);
                            await clientDB.query(
                                `INSERT INTO sales_log (item_name, item_price, quantity, total_item_price, category, description, waiter_username, table_name, sale_timestamp, customer_name)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                [
                                    item.name || 'Bilinmeyen Ürün',
                                    parseFloat(item.priceAtOrder) || 0,
                                    parseInt(item.quantity, 10) || 0,
                                    totalItemPrice,
                                    item.category || 'Diğer',
                                    item.description || null,
                                    item.waiterUsername || tableToClose.waiterUsername || currentUserInfo.username, // Siparişi alan veya masayı kapatan
                                    tableToClose.name,
                                    closingTime,
                                    tableToClose.customerNameOnTable || null
                                ]
                            );
                        }
                        await clientDB.query('COMMIT');
                        await logActivity(currentUserInfo.username, 'MASA_KAPATILDI_HESAP_ALINDI',
                            {
                                masa_adi: tableToClose.name,
                                siparis_detaylari: tableToClose.order, // Tüm sipariş detayları
                                toplam_tutar: tableToClose.total, // İndirimsiz orijinal toplam
                                islem_yapan_kasiyer: currentUserInfo.username,
                                masadaki_garson: tableToClose.waiterUsername,
                                musteri_adi: tableToClose.customerNameOnTable
                            }, 'Table', payload.tableId, clientIpAddress);

                        // Masayı sıfırla
                        tableToClose.order = [];
                        tableToClose.total = 0;
                        tableToClose.status = 'boş';
                        tableToClose.waiterId = null;
                        tableToClose.waiterUsername = null;
                        tableToClose.customerNameOnTable = null;
                        tableToClose.kitchen_status = null;
                        tableToClose.last_order_timestamp = 0;
                        broadcastTableUpdates();
                        // İstemciye özel bir başarı mesajı (opsiyonel, broadcastTableUpdates yeterli olabilir)
                        // ws.send(JSON.stringify({ type: 'table_closed_success', payload: { tableId: payload.tableId, message: `${tableToClose.name} kapatıldı.`} }));
                    } catch (error) {
                        await clientDB.query('ROLLBACK');
                        console.error("Masa kapatılırken DB Hatası:", error);
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Masa kapatılırken veritabanı sorunu oluştu.' } }));
                    } finally {
                        clientDB.release();
                    }
                } else if (tableToClose && (!tableToClose.order || tableToClose.order.length === 0)) {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Boş masa kapatılamaz.' } }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Masa bulunamadı.' } }));
                }
                break;

            case 'complete_quick_sale': // Yeni HTML'de kullanılıyor (Kasiyer için)
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                    return;
                }
                if (payload && payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
                    const quickSaleTimestamp = new Date();
                    const processedByQuickSale = payload.cashierUsername || currentUserInfo.username;
                    const customerName = payload.customerName || null;
                    const quickSaleKdsId = 'qs_' + Date.now() + '_' + Math.random().toString(16).slice(2); // Hızlı satış için benzersiz KDS ID

                    // KDS'e gönderilecek ürünleri hazırla
                    const itemsForKds = payload.items.map(item => {
                        const productDetails = products.find(p => p.id === item.productId); // Eğer ürün ID'si varsa
                        return {
                            ...item, // productId, name, priceAtOrder, quantity, description, isKgSale, grams
                            name: item.name || (productDetails ? productDetails.name : 'Hızlı Satış Ürünü'),
                            category: item.category || (productDetails ? productDetails.category : 'Hızlı Satış'),
                            kds_item_id: 'kds_qs_item_' + Date.now() + '_' + Math.random().toString(16).slice(2) + '_' + (item.productId || 'manual'),
                            kds_status_mutfak: 'new',
                            waiterUsername: processedByQuickSale // KDS'de işlemi yapanı göstermek için
                        };
                    });

                    // KDS için sanal bir masa/sipariş objesi oluştur
                    const pseudoTableForKds = {
                        id: quickSaleKdsId, // Benzersiz KDS ID'si
                        name: customerName ? `Hızlı Satış (${customerName})` : `Hızlı Satış (${quickSaleKdsId.slice(-4)})`, // KDS'de görünecek ad
                        waiterUsername: processedByQuickSale,
                        order: itemsForKds,
                        kitchen_status: 'new_order', // Başlangıç mutfak durumu
                        last_order_timestamp: quickSaleTimestamp.getTime(),
                        customerNameOnTable: customerName, // Müşteri adı
                        isQuickSale: true // Bunun bir hızlı satış olduğunu belirt
                    };
                    activeQuickSalesForKDS[quickSaleKdsId] = pseudoTableForKds; // Aktif KDS hızlı satışlarına ekle
                    broadcastToKitchen({ type: 'new_quick_sale_for_kds', payload: pseudoTableForKds }); // Mutfak ekranına gönder

                    // Veritabanına satış loglarını kaydet
                    const clientQuickSaleDB = await pool.connect();
                    try {
                        await clientQuickSaleDB.query('BEGIN');
                        for (const item of payload.items) { // payload.items orijinal istemci verisi
                            const itemPrice = parseFloat(item.priceAtOrder) || 0;
                            const itemQuantity = parseInt(item.quantity, 10) || 0;
                            const totalItemPrice = itemPrice * itemQuantity;
                            const productDetails = products.find(p => p.id === item.productId);
                            const category = item.category || (productDetails ? productDetails.category : 'Hızlı Satış');

                            await clientQuickSaleDB.query(
                                `INSERT INTO sales_log (item_name, item_price, quantity, total_item_price, category, description, waiter_username, table_name, sale_timestamp, customer_name)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                [
                                    item.name || (productDetails ? productDetails.name : 'Hızlı Satış Ürünü'),
                                    itemPrice,
                                    itemQuantity,
                                    totalItemPrice,
                                    category,
                                    item.description || null,
                                    processedByQuickSale,
                                    'Hızlı Satış', // Tablo adı
                                    quickSaleTimestamp,
                                    customerName
                                ]
                            );
                        }
                        await clientQuickSaleDB.query('COMMIT');
                        ws.send(JSON.stringify({ type: 'quick_sale_success', payload: { message: 'Hızlı satış başarıyla tamamlandı.', quickSaleKdsId: quickSaleKdsId } }));
                        await logActivity(currentUserInfo.username, 'HIZLI_SATIS_TAMAMLANDI',
                            {
                                urunler: payload.items,
                                orijinal_tutar: payload.originalTotal, // İndirimsiz
                                indirim_tutari: payload.discountAmount, // İndirim miktarı
                                odenecek_tutar: payload.finalTotal, // İndirimli toplam
                                islem_yapan: processedByQuickSale,
                                musteri_adi: customerName,
                                kds_id: quickSaleKdsId
                            }, 'QuickSale', null, clientIpAddress);
                    } catch (error) {
                        await clientQuickSaleDB.query('ROLLBACK');
                        console.error("Hızlı Satış DB Hatası:", error);
                        ws.send(JSON.stringify({ type: 'quick_sale_fail', payload: { error: 'Hızlı satış kaydedilirken bir veritabanı sorunu oluştu.' } }));
                        // Eğer DB hatası olursa KDS'den bu hızlı satışı temizlemek gerekebilir.
                        delete activeQuickSalesForKDS[quickSaleKdsId];
                        broadcastToKitchen({ type: 'kds_quick_sale_cleared_broadcast', payload: { quickSaleKdsId: quickSaleKdsId }});
                    } finally {
                        clientQuickSaleDB.release();
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'quick_sale_fail', payload: { error: 'Hızlı satış için ürün bulunmuyor.' } }));
                }
                break;

            case 'get_sales_report': // Yeni HTML'de kullanılıyor (Kasiyer için)
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                    return;
                }
                try {
                    // TO_CHAR ile timestamp formatını istemcinin beklediği gibi ayarla (DD.MM.YYYY HH24:MI:SS)
                    const reportResult = await pool.query(
                        `SELECT id, item_name, item_price, quantity, total_item_price, category, description, waiter_username, table_name, customer_name,
                         TO_CHAR(sale_timestamp AT TIME ZONE 'Europe/Istanbul', 'DD.MM.YYYY HH24:MI:SS') as sale_timestamp
                         FROM sales_log ORDER BY sale_timestamp DESC LIMIT 500`
                    );
                    ws.send(JSON.stringify({ type: 'sales_report_data', payload: { sales: reportResult.rows } }));
                } catch (error) {
                    console.error("Satış Raporu alınırken DB Hatası:", error);
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Satış raporu alınırken bir veritabanı sorunu oluştu.' } }));
                }
                break;
            
            // Aktivite Logları (eski server.js'den, yeni HTML'de direkt çağrılmıyor ama tutulabilir)
            case 'get_activity_log':
                 if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                 try {
                     const logResult = await pool.query(
                         `SELECT log_id, user_username, action_type, log_details,
                          TO_CHAR(log_timestamp AT TIME ZONE 'Europe/Istanbul', 'DD.MM.YYYY HH24:MI:SS') as log_timestamp_formatted
                          FROM activity_log ORDER BY log_timestamp DESC LIMIT 200`
                     );
                     ws.send(JSON.stringify({ type: 'activity_log_data', payload: { logs: logResult.rows.map(log => ({...log})) } }));
                 } catch (error) {
                     console.error("Aktivite Logu alınırken DB Hatası:", error);
                     ws.send(JSON.stringify({ type: 'error', payload: { message: 'Log alınırken DB sorunu.' } }));
                 }
                 break;

            // Ürün Yönetimi (Kasiyer için) - Yeni HTML ile uyumlu
            case 'add_product_to_main_menu':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.name && typeof payload.price === 'number' && payload.price >= 0 && payload.category) {
                    const newProduct = {
                        id: nextProductId++, // Global sayaçtan ID al
                        name: payload.name.toUpperCase(),
                        price: parseFloat(payload.price),
                        category: payload.category.toUpperCase()
                    };
                    products.push(newProduct);
                    await logActivity( currentUserInfo.username, 'URUN_EKLENDI_MENUYE',
                        { urun_id: newProduct.id, urun_adi: newProduct.name, fiyat: newProduct.price, kategori: newProduct.category },
                        'ProductInMemory', newProduct.id, clientIpAddress );
                    await broadcastProductsUpdate(); // Tüm istemcilere ürün listesini güncelle
                    ws.send(JSON.stringify({ type: 'main_menu_product_added', payload: { product: newProduct, message: `"${newProduct.name}" ürünü menüye başarıyla eklendi.` } }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Eksik veya geçersiz ürün bilgisi.' } }));
                }
                break;

            case 'update_main_menu_product':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.id && payload.name && typeof payload.price === 'number' && payload.price >= 0 && payload.category) {
                    const productIndex = products.findIndex(p => p.id === parseInt(payload.id));
                    if (productIndex === -1) {
                        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Güncellenecek ürün bulunamadı.' } }));
                        return;
                    }
                    const oldProduct = { ...products[productIndex] }; // Loglama için eski değerler
                    products[productIndex] = {
                        ...products[productIndex],
                        name: payload.name.toUpperCase(),
                        price: parseFloat(payload.price),
                        category: payload.category.toUpperCase()
                    };
                    await logActivity( currentUserInfo.username, 'URUN_GUNCELLEME_MENU',
                        { urun_id: products[productIndex].id, eski_degerler: oldProduct, yeni_degerler: products[productIndex] },
                        'ProductInMemory', products[productIndex].id, clientIpAddress );
                    await broadcastProductsUpdate(); // Tüm istemcilere ürün listesini güncelle
                    ws.send(JSON.stringify({ type: 'main_menu_product_updated', payload: { product: products[productIndex], message: `"${products[productIndex].name}" ürünü başarıyla güncellendi.` } }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Eksik veya geçersiz ürün güncelleme bilgisi.' } }));
                }
                break;

            // Masa Yönetimi (Kasiyer için) - Yeni HTML ile uyumlu
            case 'add_table':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.name && payload.name.trim() !== "") {
                    // Masa tipi payload'dan gelmiyorsa varsayılan olarak 'standart' ayarla
                    const newTableType = payload.type || 'standart';
                    const newTable = {
                        id: `masa-${nextTableIdCounter++}`, // Global sayaçtan ID al
                        name: payload.name.trim(),
                        type: newTableType,
                        status: "boş", order: [], total: 0, waiterId: null, waiterUsername: null, customerNameOnTable: null, kitchen_status: null, last_order_timestamp: 0
                    };
                    tables.push(newTable);
                    broadcastTableUpdates(); // Tüm istemcilere masa listesini güncelle
                    ws.send(JSON.stringify({ type: 'table_operation_success', payload: { message: `"${newTable.name}" masası başarıyla eklendi.` } }));
                    await logActivity(currentUserInfo.username, 'MASA_TANIM_EKLENDI', { masa_adi: newTable.name, masa_tipi: newTable.type }, 'TableDefinition', newTable.id, clientIpAddress);
                } else {
                    ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: 'Geçersiz veya boş masa adı.' } }));
                }
                break;

            case 'edit_table_name':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.tableId && payload.newName && payload.newName.trim() !== "") {
                    const tableToEdit = tables.find(t => t.id === payload.tableId);
                    if (tableToEdit) {
                        const oldName = tableToEdit.name;
                        tableToEdit.name = payload.newName.trim();
                        // İsteğe bağlı: Masa tipi de güncellenebilir, payload.newType gelirse
                        // if (payload.newType) tableToEdit.type = payload.newType;
                        broadcastTableUpdates();
                        ws.send(JSON.stringify({ type: 'table_operation_success', payload: { message: `Masa adı "${oldName}" -> "${tableToEdit.name}" olarak güncellendi.` } }));
                        await logActivity(currentUserInfo.username, 'MASA_TANIM_ADI_GUNCELLEME', { masa_id: tableToEdit.id, eski_ad: oldName, yeni_ad: tableToEdit.name }, 'TableDefinition', tableToEdit.id, clientIpAddress);
                    } else {
                        ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: 'Düzenlenecek masa bulunamadı.' } }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: 'Eksik veya geçersiz masa düzenleme bilgisi.' } }));
                }
                break;

            case 'delete_table':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.tableId) {
                    const tableIndexToDelete = tables.findIndex(t => t.id === payload.tableId);
                    if (tableIndexToDelete > -1) {
                        if (tables[tableIndexToDelete].status === 'dolu' && tables[tableIndexToDelete].order.length > 0) {
                            ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: `"${tables[tableIndexToDelete].name}" masası dolu olduğu için silinemez.` } }));
                            return;
                        }
                        const deletedTable = tables.splice(tableIndexToDelete, 1)[0]; // Silinen masayı al
                        broadcastTableUpdates();
                        ws.send(JSON.stringify({ type: 'table_operation_success', payload: { message: `"${deletedTable.name}" masası başarıyla silindi.` } }));
                        await logActivity(currentUserInfo.username, 'MASA_TANIM_SILINDI', { masa_id: deletedTable.id, masa_adi: deletedTable.name }, 'TableDefinition', deletedTable.id, clientIpAddress);
                    } else {
                        ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: 'Silinecek masa bulunamadı.' } }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'table_operation_fail', payload: { error: 'Eksik masa ID bilgisi.' } }));
                }
                break;

            // Garson Yönetimi (Kasiyer için) - Yeni HTML ile uyumlu
            case 'get_waiters_list': // Yeni HTML'den çağrılıyor
                if (currentUserInfo && currentUserInfo.role === 'cashier') {
                    broadcastWaitersList(ws); // Sadece istek yapan kasiyere gönder
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Bu işlem için yetkiniz yok.' } }));
                }
                break;

            case 'add_waiter':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.username && payload.password) {
                    if (users.find(u => u.username === payload.username)) {
                        ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Bu kullanıcı adı zaten mevcut.' } }));
                        return;
                    }
                    const newWaiter = {
                        id: (users.reduce((max, u) => u.id > max ? u.id : max, 0) || 0) + 1, // Benzersiz ID
                        username: payload.username,
                        password: payload.password,
                        role: 'waiter'
                    };
                    users.push(newWaiter);
                    // broadcastWaitersList(); // Tüm kasiyerlere güncelleme göndermeye gerek yok, sadece ekleyene onay.
                    ws.send(JSON.stringify({ type: 'waiter_operation_success', payload: { message: `Garson "${newWaiter.username}" başarıyla eklendi.` } }));
                    await logActivity(currentUserInfo.username, 'GARSON_EKLENDI', { garson_kullanici_adi: newWaiter.username }, 'User', newWaiter.id, clientIpAddress);
                } else {
                    ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Eksik garson bilgisi (kullanıcı adı/şifre).' } }));
                }
                break;

            case 'edit_waiter_password':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.userId && payload.newPassword) {
                    const waiterToEdit = users.find(u => u.id === parseInt(payload.userId) && u.role === 'waiter');
                    if (waiterToEdit) {
                        waiterToEdit.password = payload.newPassword;
                        ws.send(JSON.stringify({ type: 'waiter_operation_success', payload: { message: `Garson "${waiterToEdit.username}" şifresi güncellendi.` } }));
                        await logActivity(currentUserInfo.username, 'GARSON_SIFRE_GUNCELLEME', { garson_kullanici_adi: waiterToEdit.username }, 'User', waiterToEdit.id, clientIpAddress);
                    } else {
                        ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Şifresi güncellenecek garson bulunamadı.' } }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Eksik bilgi (garson ID/yeni şifre).' } }));
                }
                break;

            case 'delete_waiter':
                if (!currentUserInfo || currentUserInfo.role !== 'cashier') { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Yetkiniz yok.' } })); return; }
                if (payload && payload.userId) {
                    const waiterIdToDelete = parseInt(payload.userId);
                    // Aktif masalarda bu garsonun olup olmadığını kontrol et (opsiyonel)
                    // const isWaiterActiveOnTables = tables.some(t => t.waiterId === waiterIdToDelete);
                    // if (isWaiterActiveOnTables) {
                    //    ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Bu garsonun aktif masaları var, önce masaları devredin/kapatın.' } }));
                    //    return;
                    // }
                    const waiterIndexToDelete = users.findIndex(u => u.id === waiterIdToDelete && u.role === 'waiter');
                    if (waiterIndexToDelete > -1) {
                        const deletedWaiter = users.splice(waiterIndexToDelete, 1)[0];
                        // broadcastWaitersList(); // Sadece silen kişiye onay
                        ws.send(JSON.stringify({ type: 'waiter_operation_success', payload: { message: `Garson "${deletedWaiter.username}" başarıyla silindi.` } }));
                        await logActivity(currentUserInfo.username, 'GARSON_SILINDI', { garson_kullanici_adi: deletedWaiter.username }, 'User', deletedWaiter.id, clientIpAddress);
                    } else {
                        ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Silinecek garson bulunamadı.' } }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'waiter_operation_fail', payload: { error: 'Eksik garson ID bilgisi.' } }));
                }
                break;

            // KDS İşlemleri - Yeni HTML ile uyumlu
            case 'get_initial_kds_orders': // Mutfak ekranı bağlandığında veya yeniden bağlandığında
                if (currentUserInfo && currentUserInfo.role === 'kitchen') {
                    // Aktif masa siparişlerini ve KDS için bekleyen hızlı satışları topla
                    const activeTableOrders = tables.filter(t => (t.isQuickSale || t.status === 'dolu') && t.order && t.order.length > 0 && t.order.some(item => item.kds_status_mutfak !== 'delivered_to_customer')).map(t => ({ id: t.id, name: t.name, waiterUsername: t.waiterUsername, order: t.order.filter(item => item.kds_status_mutfak !== 'delivered_to_customer').map(item => ({ ...item })), kitchen_status: t.kitchen_status, last_order_timestamp: t.last_order_timestamp, customerNameOnTable: t.customerNameOnTable, isQuickSale: t.isQuickSale || false }));
                    const activeQuickSaleOrdersForKds = Object.values(activeQuickSalesForKDS).filter(qs => qs.order && qs.order.length > 0 && qs.order.some(item => item.kds_status_mutfak !== 'delivered_to_customer'));
                    const allKdsOrders = [...activeTableOrders, ...activeQuickSaleOrdersForKds];
                    ws.send(JSON.stringify({
                        type: 'kds_initial_orders',
                        payload: {
                            activeOrders: allKdsOrders,
                            allTables: tables.map(t=>({id: t.id, name: t.name, type: t.type})) // KDS'nin statik masa gridi için
                        }
                    }));
                }
                break;
            
            case 'kds_item_status_change': // Mutfak bir ürünün durumunu değiştirdiğinde
                if (currentUserInfo && currentUserInfo.role === 'kitchen' && payload && payload.tableId && payload.kds_item_id && payload.newStatus) {
                    let targetOrderListOwner;
                    let isQuickSaleOrder = payload.tableId.startsWith('qs_');

                    if (isQuickSaleOrder) {
                        targetOrderListOwner = activeQuickSalesForKDS[payload.tableId];
                    } else {
                        targetOrderListOwner = tables.find(t => t.id === payload.tableId);
                    }

                    if (targetOrderListOwner && targetOrderListOwner.order) {
                        const itemInOrder = targetOrderListOwner.order.find(item => item.kds_item_id === payload.kds_item_id);
                        if (itemInOrder) {
                            itemInOrder.kds_status_mutfak = payload.newStatus;
                        }

                        // Siparişin genel mutfak durumunu güncelle
                        const hasNew = targetOrderListOwner.order.some(it => it.kds_status_mutfak === 'new');
                        const hasPreparing = targetOrderListOwner.order.some(it => it.kds_status_mutfak === 'preparing');
                        const allReadyOrDelivered = targetOrderListOwner.order.every(it => it.kds_status_mutfak === 'ready' || it.kds_status_mutfak === 'delivered_to_customer');
                        const hasAnyReady = targetOrderListOwner.order.some(it => it.kds_status_mutfak === 'ready');

                        if (allReadyOrDelivered && hasAnyReady) targetOrderListOwner.kitchen_status = 'ready';
                        else if (hasPreparing) targetOrderListOwner.kitchen_status = 'preparing';
                        else if (hasNew) targetOrderListOwner.kitchen_status = 'new_order';
                        else if (targetOrderListOwner.order.every(it => it.kds_status_mutfak === 'delivered_to_customer')) targetOrderListOwner.kitchen_status = 'acknowledged';
                        else targetOrderListOwner.kitchen_status = 'acknowledged';

                        if (isQuickSaleOrder) {
                            broadcastToKitchen({ type: 'kds_quick_sale_item_updated', payload: { quickSaleKdsId: payload.tableId, item: itemInOrder, overallKitchenStatus: targetOrderListOwner.kitchen_status } });
                            if (targetOrderListOwner.kitchen_status === 'ready') {
                                broadcastToCashiers({ type: 'notify_quick_sale_ready', payload: { quickSaleKdsId: payload.tableId, displayName: targetOrderListOwner.name } });
                            }
                        } else {
                            broadcastTableUpdates(); // Normal masa siparişi ise tüm masaları güncelle
                        }
                         await logActivity(currentUserInfo.username, 'KDS_URUN_DURUM_DEGISIMI', { siparis_id: payload.tableId, urun_kds_id: payload.kds_item_id, yeni_durum: payload.newStatus, urun_adi: itemInOrder?.name }, 'KDS', payload.tableId, clientIpAddress);
                    }
                }
                break;

            case 'kds_table_status_change': // Mutfak bir siparişteki tüm ürünlerin durumunu değiştirdiğinde
                 if (currentUserInfo && currentUserInfo.role === 'kitchen' && payload && payload.tableId && payload.newStatusForAllItems) {
                    let targetOrderListOwner;
                    let isQuickSaleOrder = payload.tableId.startsWith('qs_');
                    if (isQuickSaleOrder) {
                        targetOrderListOwner = activeQuickSalesForKDS[payload.tableId];
                    } else {
                        targetOrderListOwner = tables.find(t => t.id === payload.tableId);
                    }

                    if (targetOrderListOwner && targetOrderListOwner.order) {
                        let changedItemsCount = 0;
                        targetOrderListOwner.order.forEach(item => {
                            // Sadece 'delivered_to_customer' olmayan ve 'preparing'e geçerken 'new' olanları güncelle
                            // veya 'ready'ye geçerken herhangi bir önceki durumu (new, preparing) güncelle
                            if (item.kds_status_mutfak !== 'delivered_to_customer' &&
                                (
                                    (payload.newStatusForAllItems === 'preparing' && item.kds_status_mutfak === 'new') ||
                                    (payload.newStatusForAllItems === 'ready' && (item.kds_status_mutfak === 'new' || item.kds_status_mutfak === 'preparing'))
                                )
                            ) {
                                item.kds_status_mutfak = payload.newStatusForAllItems;
                                changedItemsCount++;
                            }
                        });

                        // Siparişin genel mutfak durumunu güncelle
                        if (payload.newStatusForAllItems === 'ready') {
                             if (targetOrderListOwner.order.every(it => it.kds_status_mutfak === 'ready' || it.kds_status_mutfak === 'delivered_to_customer')) {
                                 targetOrderListOwner.kitchen_status = 'ready';
                             }
                        } else if (payload.newStatusForAllItems === 'preparing') {
                            // Sadece en az bir ürün 'preparing' olduysa ve henüz 'ready' olan yoksa genel durumu 'preparing' yap
                            if (targetOrderListOwner.order.some(it => it.kds_status_mutfak === 'preparing') &&
                                !targetOrderListOwner.order.some(it => it.kds_status_mutfak === 'ready')) {
                                targetOrderListOwner.kitchen_status = 'preparing';
                            }
                        }


                        if (isQuickSaleOrder) {
                             broadcastToKitchen({ type: 'kds_quick_sale_full_update', payload: targetOrderListOwner });
                             if (targetOrderListOwner.kitchen_status === 'ready') {
                                broadcastToCashiers({ type: 'notify_quick_sale_ready', payload: { quickSaleKdsId: payload.tableId, displayName: targetOrderListOwner.name } });
                            }
                        } else {
                            broadcastTableUpdates();
                        }
                        if (changedItemsCount > 0) {
                             await logActivity(currentUserInfo.username, 'KDS_MASA_DURUM_DEGISIMI', { siparis_id: payload.tableId, tum_urunlere_yeni_durum: payload.newStatusForAllItems }, 'KDS', payload.tableId, clientIpAddress);
                        }
                    }
                 }
                break;
            
            case 'kds_clear_quick_sale': // Mutfak bir hızlı satışı KDS ekranından temizlediğinde
                if (currentUserInfo && currentUserInfo.role === 'kitchen' && payload && payload.quickSaleKdsId) {
                    if (activeQuickSalesForKDS[payload.quickSaleKdsId]) {
                        // Sadece mutfak ekranından sil, veritabanı kaydı zaten yapılmıştı.
                        delete activeQuickSalesForKDS[payload.quickSaleKdsId];
                        // Diğer mutfak ekranlarına da bu temizleme bilgisini gönder
                        broadcastToKitchen({ type: 'kds_quick_sale_cleared_broadcast', payload: { quickSaleKdsId: payload.quickSaleKdsId }});
                        await logActivity(currentUserInfo.username, 'KDS_HIZLI_SATIS_TEMIZLENDI', { kds_id: payload.quickSaleKdsId }, 'KDS', payload.quickSaleKdsId, clientIpAddress);
                    }
                }
                break;

            case 'acknowledge_order_ready': // Garson/Kasiyer "Sipariş Hazır" bildirimini onayladığında
                if ((currentUserInfo.role === 'cashier' || currentUserInfo.role === 'waiter') && payload && payload.tableId) {
                    const table = tables.find(t => t.id === payload.tableId);
                    if (table && table.kitchen_status === 'ready') { // Sadece mutfak durumu 'ready' ise onayla
                        table.kitchen_status = 'acknowledged'; // Masa genel durumu "teslim alındı"
                        if (table.order) {
                            table.order.forEach(item => {
                                if (item.kds_status_mutfak === 'ready') {
                                    item.kds_status_mutfak = 'delivered_to_customer'; // Ürünler "müşteriye teslim edildi"
                                }
                            });
                        }
                        broadcastTableUpdates();
                        await logActivity(currentUserInfo.username, 'SIPARIS_HAZIR_ONAYLANDI', { masa_id: payload.tableId, masa_adi: table.name }, 'Table', payload.tableId, clientIpAddress);
                    }
                }
                break;
            
            case 'logout': // Yeni HTML'de kullanılıyor
                if (currentUserInfo) {
                    await logActivity(currentUserInfo.username, 'KULLANICI_CIKIS', {}, 'User', currentUserInfo.id, currentUserInfo.ip);
                    clients.delete(ws); // Kullanıcıyı aktif istemcilerden çıkar
                    console.log(`${currentUserInfo.username} çıkış yaptı.`);
                }
                break;

            default:
                ws.send(JSON.stringify({ type: 'error', payload: { message: `Sunucuda bilinmeyen mesaj tipi: ${type}` } }));
        }
    });

    ws.on('close', async () => {
        const closedUser = clients.get(ws);
        if (closedUser) {
            console.log(`İstemci ayrıldı (Bağlantı Kapandı): ${closedUser.username}`);
            // Opsiyonel: Kullanıcı aniden ayrılırsa logla
            // await logActivity(closedUser.username, 'KULLANICI_BAGLANTI_KAPANDI', {}, 'User', closedUser.id, closedUser.ip);
        }
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        const errorUser = clients.get(ws);
        console.error('WebSocket hatası:', errorUser ? errorUser.username : 'Bilinmeyen Kullanıcı', error);
        clients.delete(ws); // Hata durumunda da client'ı map'ten sil
    });
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`BALIKLI LEZZET GÜNLERİ ADİSYON Sistemi ${HTTP_PORT} portunda dinlemede.`);
    console.log(`WebSocket URL (yerel): ws://localhost:${HTTP_PORT}`);
    // Render.com'da WSS adresi `wss://balikli-adisyon.onrender.com` olacak şekilde istemci tarafında ayarlanmalıdır.
});

process.on('SIGINT', async () => { if (pool) { console.log("Veritabanı bağlantısı kapatılıyor..."); await pool.end(); } console.log("Sunucu kapatılıyor (SIGINT)..."); process.exit(0); });
process.on('SIGTERM', async () => { if (pool) { console.log("Veritabanı bağlantısı kapatılıyor..."); await pool.end(); } console.log("Sunucu kapatılıyor (SIGTERM)..."); process.exit(0); });
