# UX Design Audit Raporu: Prompt-to-Design

**Tarih:** 2026-02-08
**Hazırlayan:** UX Designer Agent
**Proje:** prompt-to-design (AI-powered Figma design automation)
**Kapsam:** Kullanıcı deneyimi, prompt-tasarım akışı, hata yönetimi, plugin UI

---

## 1. Mevcut UX Akışı Analizi

### 1.1 Sistem Mimarisi (Kullanıcı Perspektifinden)

```
Kullanıcı (Claude Code CLI)
    ↓ Doğal dil prompt
Design Agent (planlama)
    ↓ JSON plan
Execution Agent (uygulama)
    ↓ MCP tool çağrıları
MCP Server (WebSocket köprüsü)
    ↓ COMMAND mesajları
Figma Plugin (tasarım oluşturma)
    ↓
Figma Canvas'ta tasarım
```

### 1.2 Temel Akış Adımları

1. **Kullanıcı** Claude Code CLI'da doğal dil prompt yazar (ör: "Login ekranı tasarla")
2. **Design Agent** prompt'u analiz eder, Figma bağlantısını kontrol eder, session oluşturur
3. **Design Agent** JSON plan oluşturur (screen, regions, components)
4. **Design Agent** otomatik olarak Execution Agent'ı çağırır
5. **Execution Agent** JSON planı Figma API çağrılarına dönüştürür
6. **MCP Server** WebSocket üzerinden komutları Figma Plugin'e iletir
7. **Figma Plugin** komutları yürütür, sonuçları geri döndürür
8. **Execution Agent** loglama yapar, rapor oluşturur

### 1.3 Güçlü Yönler

- **Tek prompt ile uçtan uca**: Kullanıcı sadece ne istediğini söyler, gerisini sistem halleder
- **Çift agent mimarisi**: Planlama ve uygulama ayrılmış (separation of concerns)
- **Otomatik loglama**: Her adım detaylı şekilde loglanıyor (docs/design-reports/)
- **Device preset desteği**: 20+ cihaz preset'i hazır (iPhone, Pixel, iPad, Samsung)
- **Çoklu tasarım sistemi**: shadcn/ui, Apple iOS/macOS, Liquid Glass desteği
- **Session yönetimi**: Çoklu session, aktif session geçişi
- **Theme desteği**: Dark/Light tema hazır, özelleştirilebilir renk paleti

---

## 2. Kullanıcı Yolculuk Haritası (Journey Map)

### 2.1 İlk Kullanım Yolculuğu (First-Time User)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AŞAMA        │ EYLEM                │ DUYGU    │ SORUN SEVİYESİ        │
├──────────────┼──────────────────────┼──────────┼───────────────────────┤
│ Keşif        │ Projeyi klonlar      │ Meraklı  │ -                     │
│ Kurulum      │ npm install (3 pkg)  │ Sabırsız │ ⚠️ Karmaşık           │
│ Build        │ 3 ayrı build komutu  │ Bıkkın   │ ⚠️ Çok adım           │
│ Figma Setup  │ Plugin'i import eder │ Karışık  │ ❌ Yönlendirme yok    │
│ Bağlantı     │ Plugin'de Connect    │ Umutlu   │ ⚠️ Port hatası riski   │
│ İlk Prompt   │ Claude Code'da yazar │ Heyecanlı│ -                     │
│ Bekleme      │ Agent'lar çalışır    │ Endişeli │ ⚠️ İlerleme yok       │
│ Sonuç        │ Figma'da tasarım     │ Memnun   │ -                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tekrarlayan Kullanım Yolculuğu

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AŞAMA        │ EYLEM                │ DUYGU    │ SORUN SEVİYESİ        │
├──────────────┼──────────────────────┼──────────┼───────────────────────┤
│ Başlatma     │ MCP server başlatır  │ Normal   │ -                     │
│ Bağlantı     │ Plugin auto-connect  │ Rahat    │ ✅ Auto-connect var   │
│ Tasarım      │ Prompt yazar         │ Üretken  │ -                     │
│ Düzenleme    │ Değişiklik ister     │ Hayal kırıklığı │ ❌ İterasyon zor│
│ Çoklu Ekran  │ Yeni ekran ister     │ Normal   │ ⚠️ Context kaybı     │
│ Export       │ Tasarımı kullanır    │ Memnun   │ -                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. UX Sorunları ve Önem Dereceleri

### 3.1 CRITICAL (Kritik) Sorunlar

#### C1: Tasarım İterasyonu/Düzenleme Akışı Yok
**Açıklama:** Mevcut sistemde "bu butonu kırmızı yap" veya "header'ı değiştir" gibi düzenleme komutları için yapılandırılmış bir akış bulunmuyor. Her değişiklik için tasarımın sıfırdan oluşturulması gerekiyor.

**Kanıt:** Design Agent sadece yeni plan oluşturma akışına sahip. Mevcut tasarımı analiz edip kısmi güncelleme yapacak mekanizma yok. `design_session_get` session bilgisini döndürüyor ama mevcut Figma canvas'taki node'ları inceleme yeteneği agent tanımlarında kullanılmıyor.

**Etki:** Kullanıcılar küçük değişiklikler için bile tüm tasarımı yeniden oluşturmak zorunda. Bu büyük zaman kaybı ve kullanıcı memnuniyetsizliği yaratıyor.

**Öneri:**
- "Edit mode" agent'ı ekle (mevcut node'ları bulup değiştirme)
- Incremental update akışı (sadece değişen bölümleri güncelle)
- "Undo" mekanizması (son değişikliği geri al)

#### C2: İlerleme Göstergesi / Feedback Loop Eksik
**Açıklama:** Kullanıcı prompt'u gönderdikten sonra Design Agent → Execution Agent → Figma zincirinde ne olduğunu göremiyor. Özellikle karmaşık tasarımlarda 30+ tool çağrısı yapılırken kullanıcı tamamen karanlıkta.

**Kanıt:** `handler-factory.ts` (satır 19-36) basit bir try-catch ile sonuç döndürüyor. Ara durum bildirimi yok. Loglama dosya bazlı (docs/design-reports/) ama real-time değil.

**Etki:** Kullanıcı "çalışıyor mu, takıldı mı?" kaygısı yaşıyor. Uzun süren tasarımlarda iptal edip yeniden başlatma riski var.

**Öneri:**
- Claude Code CLI'da progress indicator (ör: "3/15 bileşen oluşturuluyor...")
- Figma Plugin UI'da canlı ilerleme çubuğu
- Session state'e progress tracking ekle

#### C3: Bağlantı Kopması Durumunda Veri Kaybı
**Açıklama:** WebSocket bağlantısı koparsa, yarım kalan tasarım kurtarılamıyor. `embedded-ws-server.ts` satır 467-473'te bağlantı koptuğunda client terminate ediliyor ama pending komutlar için recovery mekanizması yok.

**Kanıt:** `COMMAND_TIMEOUT = 30000` (30 saniye) sonra komut zaman aşımına uğruyor ve hata döndürülüyor. Pending callbacks temizleniyor ama retry mekanizması yok. Execution Agent'ın JSON log'u son yazılan durumda kalıyor ama devam mekanizması yok.

**Etki:** Uzun süren tasarımlarda bağlantı kopması = baştan başlama. Kullanıcı güven kaybı.

**Öneri:**
- Command queue ile retry mekanizması
- Execution log'dan devam etme (resume) özelliği
- Figma Plugin'de offline buffer

### 3.2 HIGH (Yüksek) Sorunlar

#### H1: Onboarding Deneyimi Yetersiz
**Açıklama:** Yeni kullanıcı için kurulum süreci karmaşık: 3 ayrı paket kurulumu, 3 ayrı build, Figma plugin import, MCP server başlatma. `docs/SETUP_GUIDE.md` mevcut ama Plugin UI'daki Quick Start (ui.html satır 856-879) güncel değil.

**Kanıt:** Plugin UI "Start WebSocket server" diyor ama MCP server embedded WS kullanıyor. Bu yanlış yönlendirme.

**Etki:** İlk deneyimde başarısızlık oranı yüksek olabilir. "Çalışmıyor" algısı.

**Öneri:**
- Tek komutla kurulum scripti (`npm run setup-all`)
- Plugin UI'da güncel ve doğru setup guide
- Bağlantı sihirbazı (connection wizard)
- İlk kullanımda otomatik test bağlantısı

#### H2: Hata Mesajları Teknik ve Kullanıcı Dostu Değil
**Açıklama:** Hata mesajları geliştirici odaklı, son kullanıcı için anlaşılması zor.

**Kanıtlar:**
- `handler-factory.ts` satır 31: `Error: ${error instanceof Error ? error.message : "Unknown error"}` - Ham hata mesajı döndürülüyor
- `embedded-ws-server.ts` satır 313: `"No Figma plugin connected. Please open the Figma plugin first."` - İyi ama yetersiz (hangi adım?)
- `embedded-ws-server.ts` satır 328: `"Command timeout - no response from Figma plugin"` - Neden timeout oldu bilgisi yok
- Session state hataları: `"No active session"`, `"Screen with name already exists"` - Çözüm önerisi yok

**Etki:** Kullanıcı hatayı anlayamıyor, ne yapacağını bilemiyor.

**Öneri:**
- Error taxonomy oluştur (connection, timeout, validation, figma-api)
- Her hata için: Neden oldu + Ne yapılmalı + Otomatik recovery varsa uygula
- Kullanıcı dostu hata mesajı template'i: "X yapılamadı. Muhtemelen Y nedeniyle. Z'yi deneyin."

#### H3: Session Persistence Yok (In-Memory)
**Açıklama:** `state.ts`'deki `SessionManager` tüm session'ları bellekte tutuyor. MCP server restart edildiğinde tüm session verileri kayboluyor.

**Kanıt:** `state.ts` satır 18: `private sessions: Map<string, DesignSession> = new Map()` - Sadece in-memory.

**Etki:** Uzun süreli çalışmalarda, server yeniden başlatıldığında tüm session context'i (hangi ekranlar oluşturuldu, hangi bileşenler kayıtlı) kayboluyor.

**Öneri:**
- Dosya bazlı session persistence (JSON dosyaya kayıt)
- Session restore mekanizması
- Auto-save her kritik operasyonda

#### H4: Çoklu Ekran Akışı Sınırlı
**Açıklama:** Session sistemi çoklu ekran desteği sunuyor (`screens[]` array) ama agent tanımlarında çoklu ekran oluşturma akışı belgelenmemiş. Kullanıcı "3 ekranlı uygulama tasarla" dediğinde akış belirsiz.

**Kanıt:** `design-agent.md` tek ekran plan formatı gösteriyor. Çoklu ekran için plan yapısı, ekranlar arası geçiş (prototype flows) tanımlanmamış.

**Etki:** Gerçek dünya kullanımında uygulamalar çoklu ekranla oluşturulur. Tek ekranlık sınırlama değer teklifini zayıflatıyor.

**Öneri:**
- Çoklu ekran plan formatı (screens array)
- Ekranlar arası prototip flow tanımı
- Batch execution (birden fazla ekranı sırayla oluştur)

### 3.3 MEDIUM (Orta) Sorunlar

#### M1: Plugin UI Sadece Bağlantı Yönetimi İçin
**Açıklama:** Figma Plugin UI (ui.html) sadece WebSocket bağlantı durumunu gösteriyor. Tasarım oluşturma ile ilgili hiçbir görsel geri bildirim yok.

**Kanıt:** UI bileşenleri: Connection Card, Session Selector, Activity Log, Config Section, Instructions Card. Hiçbirinde "şu anda X oluşturuluyor" bilgisi yok. Activity Log sadece teknik mesajları gösteriyor (COMMAND received, RESPONSE sent).

**Etki:** Plugin UI'ın potansiyeli kullanılmıyor. Kullanıcı sadece "Connected" görüyor ama ne yapıldığını bilmiyor.

**Öneri:**
- Real-time component creation göstergesi
- Mini preview/thumbnail
- Progress bar (oluşturulan bileşen sayısı)
- Son oluşturulan tasarımın özeti

#### M2: Design Token Tutarsızlığı
**Açıklama:** Theme token'ları `presets.ts`'de tanımlı ama `design-agent.md`'de farklı renk değerleri hardcoded olarak yazılmış.

**Kanıt:**
- `presets.ts` satır 148: Dark theme primary: `#8B5CF6`
- `design-agent.md` Theme Color Palette: Primary renk belirtilmemiş, sadece surface/text renkleri var
- Agent'lar theme token'larını doğrudan kullanmıyor, renkler her seferinde plan JSON'ında hardcoded

**Etki:** Tema tutarsızlıkları, farklı tasarımlar arasında renk uyumsuzlukları.

**Öneri:**
- Agent'ların theme token'larını session'dan okumasını sağla
- Renk paletini tek kaynaktan yönet (single source of truth)
- Token değiştiğinde tüm tasarımların güncellenmesini sağla

#### M3: Figma Plugin Auto-Connect Zamanlama Sorunu
**Açıklama:** Plugin UI `setTimeout(connect, 500)` ile otomatik bağlanıyor ama MCP server henüz başlamamış olabilir.

**Kanıt:** `ui.html` satır 1610: `setTimeout(connect, 500)` - Sabit 500ms bekleme. MCP server'ın başlaması daha uzun sürebilir.

**Etki:** İlk açılışta bağlantı hatası, kullanıcı manuel "Connect" basması gerekiyor.

**Öneri:**
- Exponential backoff ile auto-connect (zaten reconnect'te var, ilk bağlantıya da uygula)
- "MCP server'ı bekleniyor..." durumu göster

#### M4: Log Dosyaları Kullanıcı İçin Erişilmez
**Açıklama:** Design reports `docs/design-reports/` altında oluşturuluyor ama kullanıcıya bunların varlığı bildirilmiyor.

**Kanıt:** Execution Agent log dosyaları oluşturuyor (3-execution-log.json, 4-final-report.md) ama kullanıcı CLI'da bu dosyaların yolunu görmüyor.

**Etki:** Değerli debug ve audit bilgisi kullanılmıyor.

**Öneri:**
- Tasarım tamamlandığında rapor linkini CLI'da göster
- "Detaylar için: docs/design-reports/xxx/ dizinine bakın" mesajı

#### M5: Tool Sayısı Çok Fazla (100+), Karmaşıklık
**Açıklama:** `tools/index.ts`'de 26 modülden 100+ tool kayıtlı. Bu, Claude'un doğru tool'u seçmesini zorlaştırabilir.

**Kanıt:** 26 ayrı tool modülü: shapes, text, components, design-system, icons, layout, styling, transform, manipulation, query, component-library, styles-variables, masks, boolean, plugin-data, storage, media, viewport, pages, theme, connection, session, linter, smart-layout, component-registry, debug, variant-generator.

**Etki:** LLM'in doğru tool'u seçme başarısı düşebilir. Gereksiz tool çağrıları.

**Öneri:**
- Tool gruplarını kullanım senaryolarına göre kategorize et
- Sık kullanılan tool'ları öne çıkar
- Agent tool listelerini daralt (execution-agent zaten bunu yapıyor)

### 3.4 LOW (Düşük) Sorunlar

#### L1: Plugin UI Dark Mode Desteği Yok
**Açıklama:** Plugin UI sadece light mode. Figma'nın dark mode'unda görsel uyumsuzluk.

**Öneri:** CSS değişkenlerini Figma tema ile senkronize et.

#### L2: Accessibility (Erişilebilirlik) Eksik
**Açıklama:** Plugin UI'da ARIA label'ları, keyboard navigation, screen reader desteği yok.

**Öneri:** WCAG 2.1 AA uyumluluğu sağla.

#### L3: Version Badge Statik
**Açıklama:** `ui.html` satır 755: `v1.0.0` hardcoded. Güncellemelerle senkronize değil.

**Öneri:** package.json'dan version çek.

#### L4: Help/About Fonksiyonları Boş
**Açıklama:** `ui.html` satır 1243-1249: `showHelp()` ve `showAbout()` sadece log mesajı yazıyor. Gerçek yardım içeriği yok.

**Öneri:** Modal dialog ile yardım dokümantasyonu göster.

---

## 4. Hata Yönetimi Değerlendirmesi

### 4.1 Mevcut Hata Katmanları

| Katman | Mekanizma | Yeterlilik |
|--------|-----------|------------|
| MCP Server başlatma | Port conflict detection, SIGINT/SIGTERM handlers | ✅ İyi |
| WebSocket bağlantı | Heartbeat (15s), reconnect (5 deneme, exp. backoff) | ✅ İyi |
| Tool handler | Try-catch, isError flag | ⚠️ Temel |
| Session yönetimi | Uniqueness check, null guard | ⚠️ Temel |
| Figma Plugin UI | XSS prevention (escapeHtml), event delegation | ✅ İyi |
| Agent akışı | Connection check, reportDir kontrolü | ⚠️ Kısmi |

### 4.2 Eksik Hata Yönetimi Alanları

1. **Kısmi başarısızlık kurtarma:** 10 bileşenden 7'si oluşturuldu, 3'ü hata aldı. Sistem "partial success" raporluyor ama kurtarma stratejisi yok.

2. **Zaman aşımı granülerliği:** Tüm komutlar için tek timeout (30s). Basit text oluşturma ve karmaşık gradient oluşturma aynı süre.

3. **Rate limiting:** Figma API'ye art arda çok hızlı çağrı yapılırsa throttling mekanizması yok.

4. **Graceful degradation:** Font bulunamazsa fallback var ama ikon bulunamazsa, bileşen tipi desteklenmezse ne olacağı belirsiz.

### 4.3 Hata Mesajı Kalite Analizi

| Hata Mesajı | Kalite | Eksik |
|-------------|--------|-------|
| "No Figma plugin connected. Please open the Figma plugin first." | ⭐⭐⭐ | Adım adım yönlendirme |
| "Command timeout - no response from Figma plugin" | ⭐⭐ | Neden timeout, ne yapılmalı |
| "No active session" | ⭐ | Nasıl session oluşturulur |
| "Screen with name already exists" | ⭐⭐ | Alternatif isim önerisi |
| "Port 9001 already in use" | ⭐⭐⭐ | `lsof` komutu gösteriyor ✅ |
| "Error: Unknown error" | ⭐ | Tamamen bilgisiz |

---

## 5. İyileştirme Önerileri

### 5.1 Kısa Vadeli (1-2 Hafta)

| # | Öneri | Etki | Karmaşıklık |
|---|-------|------|-------------|
| K1 | Hata mesajlarını kullanıcı dostu hale getir | Yüksek | Düşük |
| K2 | Plugin UI Quick Start Guide'ı güncelle (embedded WS) | Orta | Düşük |
| K3 | Tasarım tamamlandığında rapor yolunu CLI'da göster | Orta | Düşük |
| K4 | Plugin UI'da "Current Action" göstergesi ekle | Yüksek | Orta |
| K5 | Help/About modalları ile gerçek içerik ekle | Düşük | Düşük |

### 5.2 Orta Vadeli (1-2 Ay)

| # | Öneri | Etki | Karmaşıklık |
|---|-------|------|-------------|
| O1 | Tasarım düzenleme (edit mode) agent'ı | Kritik | Yüksek |
| O2 | Session persistence (dosya bazlı kayıt) | Yüksek | Orta |
| O3 | Real-time ilerleme göstergesi (progress tracking) | Yüksek | Orta |
| O4 | Çoklu ekran plan formatı ve batch execution | Yüksek | Yüksek |
| O5 | Command retry mekanizması | Orta | Orta |
| O6 | Plugin UI dark mode desteği | Düşük | Düşük |

### 5.3 Uzun Vadeli (3+ Ay)

| # | Öneri | Etki | Karmaşıklık |
|---|-------|------|-------------|
| U1 | Görsel feedback loop: screenshot → analiz → düzeltme | Kritik | Çok Yüksek |
| U2 | Tasarım template/preset sistemi | Yüksek | Yüksek |
| U3 | Collaborative editing (çoklu kullanıcı) | Orta | Çok Yüksek |
| U4 | Design system token synchronization | Orta | Yüksek |
| U5 | Undo/redo mekanizması | Yüksek | Yüksek |
| U6 | Plugin UI'da interactive preview | Orta | Yüksek |

---

## 6. Plugin UI İyileştirme Önerileri

### 6.1 Mevcut Durum Değerlendirmesi

**Güçlü Yönler:**
- Temiz, modern tasarım (gradient header, rounded corners, subtle shadows)
- Animasyonlar (ripple, pulse, heartbeat) bağlantı durumunu net gösteriyor
- Activity log ile teknik debug kolaylığı
- XSS koruması (escapeHtml, event delegation)
- Responsive session selector

**Zayıf Yönler:**
- Sadece bağlantı yönetimi odaklı (tasarım akışı görünmüyor)
- Kullanıcıya "şu anda ne yapılıyor" bilgisi verilmiyor
- Dark mode eksik
- Erişilebilirlik (a11y) eksik
- Quick Start Guide güncel değil

### 6.2 Önerilen UI İyileştirmeleri

#### A. "Design Activity" Paneli (Yeni)
```
┌─ Design Activity ────────────────────────────┐
│ 📐 Creating: Dashboard Screen                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 7/12        │
│                                               │
│ ✅ MainFrame (393x852)                        │
│ ✅ Header                                     │
│ ✅ Header > Title "Dashboard"                 │
│ ✅ Content                                    │
│ ✅ HeroCard (gradient)                        │
│ ✅ StatsRow                                   │
│ 🔄 StatCard "Active Users" ← şu anda        │
│ ⏳ StatCard "Revenue"                         │
│ ⏳ StatCard "Signups"                         │
│ ⏳ StatCard "Churn"                           │
│ ⏳ Footer                                     │
│ ⏳ TabBar                                     │
└───────────────────────────────────────────────┘
```

#### B. Güncellenmiş Connection Card
```
┌─ Connection ─────────────────────────────────┐
│ 🟢 Connected to: My Dashboard Project        │
│ Session: abc-123... | Uptime: 05:32          │
│                                               │
│ Messages: 47 | Latency: 12ms | 💓 Active     │
│                                               │
│ Last Action: figma_create_frame (success)     │
│ [Disconnect]                                  │
└───────────────────────────────────────────────┘
```

#### C. Session Detayları (Genişletilmiş)
```
┌─ Session Details ────────────────────────────┐
│ 📱 Device: iPhone 15 (393x852)               │
│ 🎨 Theme: Dark                                │
│ 📦 Library: shadcn                            │
│                                               │
│ Screens: 2/3 completed                        │
│ ├── ✅ Login Screen                           │
│ ├── ✅ Dashboard                              │
│ └── 🔄 Profile (in progress)                 │
│                                               │
│ Components: 24 registered                     │
└───────────────────────────────────────────────┘
```

#### D. Error Toast (Yeni)
```
┌─ ⚠️ Warning ─────────────────────────────────┐
│ Font "CustomFont" not available.              │
│ Using "Inter" as fallback.                    │
│                                  [Dismiss]    │
└───────────────────────────────────────────────┘
```

---

## 7. Öğrenilebilirlik (Learnability) Değerlendirmesi

| Kriter | Puan (1-5) | Açıklama |
|--------|------------|----------|
| İlk kullanım kolaylığı | 2/5 | Çok adımlı kurulum, teknik bilgi gerekli |
| Keşfedilebilirlik | 3/5 | Agent sistemi otomatik ama hangi komutların desteklendiği belirsiz |
| Hata kurtarma | 2/5 | Hata mesajları teknik, çözüm önerileri yetersiz |
| Tutarlılık | 4/5 | Agent yapısı tutarlı, tema sistemi tutarlı |
| Geri bildirim | 2/5 | Real-time feedback eksik, log dosyaları gizli |
| Verimlilik | 3/5 | Tek prompt ile tasarım harika ama düzenleme çok zor |
| Bellek yükü | 3/5 | Prompt formatını öğrenmek gerekmiyor ama kurulum adımları çok |

**Genel Öğrenilebilirlik Puanı: 2.7/5**

---

## 8. Sonuç ve Öncelikli Eylem Planı

### En Yüksek Öncelikli 5 İyileştirme

1. **Tasarım düzenleme mekanizması** (C1) - Ürünün en büyük eksikliği
2. **Real-time ilerleme göstergesi** (C2) - Kullanıcı güvenini artırır
3. **Hata mesajlarını iyileştir** (H2) - Hızlı kazanım, düşük maliyet
4. **Session persistence** (H3) - Veri kaybını önler
5. **Plugin UI'da Design Activity paneli** (M1) - Kullanıcı deneyimini zenginleştirir

### Risk Değerlendirmesi

| Risk | Olasılık | Etki | Mevcut Azaltma |
|------|----------|------|----------------|
| Bağlantı kopması ve veri kaybı | Orta | Yüksek | Reconnect var ama resume yok |
| Hatalı tasarım çıktısı | Orta | Orta | Lint check ve loglama mevcut |
| Kullanıcı hayal kırıklığı (düzenleme) | Yüksek | Yüksek | Yok |
| Port çakışması | Düşük | Düşük | Hata mesajı ve kill komutu |
| Session kaybı (restart) | Orta | Orta | Yok |

---

*Bu rapor, prompt-to-design projesinin mevcut durumunun kapsamlı UX analizini içermektedir. Öneriler, kullanıcı deneyimini iyileştirmek ve ürünün değer teklifini güçlendirmek amacıyla hazırlanmıştır.*
