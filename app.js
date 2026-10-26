// Clean, neutral default template for NOVICELER CV Maker
const DEFAULT_CV_DATA = {
  fullName: "",
  emailPrimary: "",
  emailSecondary: "",
  phone: "",
  linkedin: "",
  extraContacts: [],
  sections: [
    {
      id: "sec-edu",
      title: "EDUCATION",
      type: "detailed",
      entries: [
        {
          org: "",
          date: "",
          subtitle: "",
          bullets: []
        }
      ]
    },
    {
      id: "sec-exp",
      title: "PROFESSIONAL EXPERIENCE",
      type: "detailed",
      entries: [
        {
          org: "",
          date: "",
          subtitle: "",
          bullets: [""]
        }
      ]
    },
    {
      id: "sec-lead",
      title: "LEADERSHIP & EXTRACURRICULAR ACTIVITIES",
      type: "detailed",
      entries: [
        {
          org: "",
          date: "",
          subtitle: "",
          bullets: [""]
        }
      ]
    },
    {
      id: "sec-vol",
      title: "VOLUNTEER EXPERIENCE",
      type: "detailed",
      entries: [
        {
          org: "",
          date: "",
          subtitle: "",
          bullets: [""]
        }
      ]
    },
    {
      id: "sec-cert",
      title: "CERTIFICATIONS",
      type: "list",
      items: [""]
    },
    {
      id: "sec-skills",
      title: "SKILLS & INTERESTS",
      type: "skills",
      skills: [
        { label: "Languages", value: "" },
        { label: "Computer Skills", value: "" },
        { label: "Interests", value: "" }
      ]
    }
  ]
};

const STORAGE_KEY = "noviceler_cv_maker_data_v2";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

let cvData = loadFromStorage() || structuredClone(DEFAULT_CV_DATA);
let currentZoom = 1;

function showToast(message) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}

function pulseSaveBadge() {
  const badge = document.getElementById("saveStatusBadge");
  if (!badge) return;
  badge.textContent = "✓ Kaydedildi";
  badge.style.transform = "scale(1.05)";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 200);
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    pulseSaveBadge();
  } catch (e) {
    console.warn("LocalStorage kaydedilemedi:", e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("LocalStorage okunamadı:", e);
  }
  return null;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAllContactItems() {
  const list = [];
  if (cvData.emailPrimary && cvData.emailPrimary.trim()) list.push(cvData.emailPrimary.trim());
  if (cvData.emailSecondary && cvData.emailSecondary.trim()) list.push(cvData.emailSecondary.trim());
  if (cvData.phone && cvData.phone.trim()) list.push(cvData.phone.trim());
  if (cvData.linkedin && cvData.linkedin.trim()) list.push(cvData.linkedin.trim());
  (cvData.extraContacts || []).forEach(c => {
    if (c && c.trim()) list.push(c.trim());
  });
  return list;
}

function highlightAndScrollToCard(cardId) {
  const el = document.getElementById(cardId);
  if (!el) return;
  el.classList.remove("collapsed");
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("pulse-highlight");
  setTimeout(() => {
    el.classList.remove("pulse-highlight");
  }, 1400);
}

// =====================================================
// 1. RENDER LIVE A4 PREVIEW & PAGE FILL METER
// =====================================================
function renderPreview() {
  const page = document.getElementById("cvPage");
  if (!page) return;

  const displayName = (cvData.fullName && cvData.fullName.trim())
    ? cvData.fullName.trim()
    : "AD SOYAD";

  const activeContacts = getAllContactItems();
  const contactsListToRender = activeContacts.length > 0
    ? activeContacts
    : ["eposta@ornek.com", "(+90) 5XX XXX XX XX", "linkedin.com/in/ad-soyad"];

  const contactsHtml = contactsListToRender
    .map(c => `<span>${escapeHtml(c)}</span>`)
    .join(`<span class="sep">|</span>`);

  let sectionsHtml = "";

  (cvData.sections || []).forEach((sec, secIdx) => {
    if (!sec.title && (!sec.entries || !sec.entries.length)) return;

    let bodyHtml = "";

    if (sec.type === "detailed") {
      bodyHtml = (sec.entries || [])
        .map(entry => {
          const hasAnyContent =
            (entry.org && entry.org.trim()) ||
            (entry.date && entry.date.trim()) ||
            (entry.subtitle && entry.subtitle.trim()) ||
            (entry.bullets || []).some(b => b && b.trim());

          if (!hasAnyContent) {
            return "";
          }

          const bullets = (entry.bullets || []).filter(b => b && b.trim() !== "");
          const bulletsHtml = bullets.length
            ? `<ul class="cv-bullets">${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
            : "";

          return `
            <div class="cv-entry">
              <div class="cv-entry-row1">
                <span class="cv-entry-org">${escapeHtml(entry.org)}</span>
                <span class="cv-entry-date">${escapeHtml(entry.date)}</span>
              </div>
              ${entry.subtitle ? `<div class="cv-entry-row2">${escapeHtml(entry.subtitle)}</div>` : ""}
              ${bulletsHtml}
            </div>
          `;
        })
        .join("");
    } else if (sec.type === "list") {
      const items = (sec.items || []).filter(i => i && i.trim() !== "");
      if (items.length) {
        bodyHtml = `<ul class="cv-simple-list">
          ${items.map(item => {
            const commaIdx = item.indexOf(",");
            if (commaIdx > 0 && commaIdx < 45) {
              const firstPart = escapeHtml(item.slice(0, commaIdx));
              const restPart = escapeHtml(item.slice(commaIdx));
              return `<li><strong>${firstPart}</strong>${restPart}</li>`;
            }
            return `<li>${escapeHtml(item)}</li>`;
          }).join("")}
        </ul>`;
      }
    } else if (sec.type === "skills") {
      const skills = (sec.skills || []).filter(s => (s.label && s.label.trim()) || (s.value && s.value.trim()));
      if (skills.length) {
        bodyHtml = `<div class="cv-skills-list">
          ${skills.map(s => `
            <div class="cv-skill-row">
              ${s.label ? `<span class="cv-skill-label">${escapeHtml(s.label)}:</span>` : ""}
              <span class="cv-skill-val">${escapeHtml(s.value)}</span>
            </div>
          `).join("")}
        </div>`;
      }
    }

    sectionsHtml += `
      <div class="cv-section" data-sec-idx="${secIdx}" title="Bu bölümü düzenlemek için tıklayın" style="cursor:pointer;">
        <div class="cv-section-title">${escapeHtml(sec.title)}</div>
        ${bodyHtml}
      </div>
    `;
  });

  page.innerHTML = `
    <div class="cv-header" title="Kişisel bilgileri düzenlemek için tıklayın" style="cursor:pointer;">
      <div class="cv-name">${escapeHtml(displayName)}</div>
      <div class="cv-contact">${contactsHtml}</div>
    </div>
    ${sectionsHtml}
  `;

  // Click on header -> scroll to personal card
  const headerEl = page.querySelector(".cv-header");
  if (headerEl) {
    headerEl.onclick = () => {
      highlightAndScrollToCard("sec-personal-card");
      const fnInput = document.getElementById("fullName");
      if (fnInput) fnInput.focus();
    };
  }

  // Click on any section -> scroll to that section's editor card
  page.querySelectorAll(".cv-section").forEach(secNode => {
    secNode.onclick = () => {
      const idx = secNode.getAttribute("data-sec-idx");
      highlightAndScrollToCard(`editor-sec-${idx}`);
    };
  });

  updatePageFillMeter();
}

function updatePageFillMeter() {
  const page = document.getElementById("cvPage");
  const badge = document.getElementById("pageFillBadge");
  if (!page || !badge) return;

  // Measure actual content height inside A4 page
  // 297mm at 96dpi is ~1122.5px
  const A4_HEIGHT_PX = 1122;
  const children = Array.from(page.children);
  let contentHeight = 105; // top + bottom padding (~28mm)
  children.forEach(ch => {
    contentHeight += ch.offsetHeight + 10;
  });

  const pct = Math.min(150, Math.round((contentHeight / A4_HEIGHT_PX) * 100));

  if (pct <= 100) {
    badge.textContent = `Tek Sayfa A4 (%${pct} Dolu)`;
    badge.className = "page-fill-badge good";
  } else {
    badge.textContent = `⚠ 2. Sayfaya Taşıyor (%${pct}) — Puntoyu küçültebilirsiniz`;
    badge.className = "page-fill-badge warn";
  }
}

// =====================================================
// 2. RENDER QUICK NAV PILLS & LEFT FORM EDITOR
// =====================================================
function renderNavPills() {
  const navContainer = document.getElementById("sectionNavPills");
  if (!navContainer) return;
  navContainer.innerHTML = "";

  const personalPill = document.createElement("button");
  personalPill.type = "button";
  personalPill.className = "nav-pill";
  personalPill.textContent = "👤 Kişisel Bilgiler";
  personalPill.onclick = () => highlightAndScrollToCard("sec-personal-card");
  navContainer.appendChild(personalPill);

  (cvData.sections || []).forEach((sec, idx) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "nav-pill";
    const shortTitle = (sec.title || "Bölüm").length > 18
      ? (sec.title || "Bölüm").slice(0, 16) + "…"
      : (sec.title || "Bölüm");
    pill.textContent = shortTitle;
    pill.onclick = () => highlightAndScrollToCard(`editor-sec-${idx}`);
    navContainer.appendChild(pill);
  });
}

function renderEditor() {
  renderNavPills();

  const fullNameInput = document.getElementById("fullName");
  const emailPrimaryInput = document.getElementById("emailPrimary");
  const emailSecondaryInput = document.getElementById("emailSecondary");
  const phoneInput = document.getElementById("phoneInput");
  const linkedinInput = document.getElementById("linkedinInput");

  fullNameInput.value = cvData.fullName || "";
  emailPrimaryInput.value = cvData.emailPrimary || "";
  emailSecondaryInput.value = cvData.emailSecondary || "";
  phoneInput.value = cvData.phone || "";
  linkedinInput.value = cvData.linkedin || "";

  fullNameInput.oninput = (e) => {
    cvData.fullName = e.target.value;
    saveToStorage();
    renderPreview();
  };
  emailPrimaryInput.oninput = (e) => {
    cvData.emailPrimary = e.target.value;
    saveToStorage();
    renderPreview();
  };
  emailSecondaryInput.oninput = (e) => {
    cvData.emailSecondary = e.target.value;
    saveToStorage();
    renderPreview();
  };
  phoneInput.oninput = (e) => {
    cvData.phone = e.target.value;
    saveToStorage();
    renderPreview();
  };
  linkedinInput.oninput = (e) => {
    cvData.linkedin = e.target.value;
    saveToStorage();
    renderPreview();
  };

  renderExtraContactsEditor();

  const container = document.getElementById("sectionsEditorContainer");
  container.innerHTML = "";

  cvData.sections.forEach((sec, secIdx) => {
    const secEl = document.createElement("div");
    secEl.className = "form-section";
    secEl.id = `editor-sec-${secIdx}`;

    const countBadgeText =
      sec.type === "detailed"
        ? `${(sec.entries || []).length} Kayıt`
        : sec.type === "list"
        ? `${(sec.items || []).length} Madde`
        : `${(sec.skills || []).length} Satır`;

    const headerEl = document.createElement("div");
    headerEl.className = "section-header";
    headerEl.innerHTML = `
      <input type="text" class="section-title-input" value="${escapeHtml(sec.title)}" placeholder="BÖLÜM BAŞLIĞI (Örn: EDUCATION)" />
      <span class="sec-meta-pill">${countBadgeText}</span>
      <div class="section-header-actions">
        <button type="button" class="icon-btn" title="Daralt / Genişlet" data-action="toggle">▾</button>
        <button type="button" class="icon-btn" title="Yukarı Taşı" data-action="up">▲</button>
        <button type="button" class="icon-btn" title="Aşağı Taşı" data-action="down">▼</button>
        <button type="button" class="icon-btn danger" title="Bölümü Sil" data-action="delete">✕</button>
      </div>
    `;

    const titleInput = headerEl.querySelector(".section-title-input");
    titleInput.oninput = (e) => {
      sec.title = e.target.value;
      saveToStorage();
      renderNavPills();
      renderPreview();
    };

    headerEl.querySelector('[data-action="toggle"]').onclick = () => {
      secEl.classList.toggle("collapsed");
    };

    headerEl.querySelector('[data-action="up"]').onclick = () => {
      if (secIdx > 0) {
        const temp = cvData.sections[secIdx - 1];
        cvData.sections[secIdx - 1] = cvData.sections[secIdx];
        cvData.sections[secIdx] = temp;
        saveToStorage();
        renderEditor();
        renderPreview();
      }
    };

    headerEl.querySelector('[data-action="down"]').onclick = () => {
      if (secIdx < cvData.sections.length - 1) {
        const temp = cvData.sections[secIdx + 1];
        cvData.sections[secIdx + 1] = cvData.sections[secIdx];
        cvData.sections[secIdx] = temp;
        saveToStorage();
        renderEditor();
        renderPreview();
      }
    };

    headerEl.querySelector('[data-action="delete"]').onclick = () => {
      if (confirm(`"${sec.title}" bölümünü silmek istediğinize emin misiniz?`)) {
        cvData.sections.splice(secIdx, 1);
        saveToStorage();
        renderEditor();
        renderPreview();
      }
    };

    secEl.appendChild(headerEl);

    const bodyEl = document.createElement("div");
    bodyEl.className = "entries-container";

    if (sec.type === "detailed") {
      (sec.entries || []).forEach((entry, entryIdx) => {
        const card = document.createElement("div");
        card.className = "entry-card";

        card.innerHTML = `
          <div class="entry-card-header">
            <span class="entry-card-title">#${entryIdx + 1} Kayıt</span>
            <div>
              <button type="button" class="icon-btn" data-act="e-up" title="Yukarı">▲</button>
              <button type="button" class="icon-btn" data-act="e-down" title="Aşağı">▼</button>
              <button type="button" class="icon-btn danger" data-act="e-del" title="Kaydı Sil">Sil</button>
            </div>
          </div>
          <div class="form-grid" style="padding:0;">
            <div class="form-group">
              <label>Kurum / Okul / Topluluk Adı (Kalın Sol)</label>
              <input type="text" data-field="org" value="${escapeHtml(entry.org)}" placeholder="Örn: Üniversite veya Kurum Adı" />
            </div>
            <div class="form-group">
              <label>Tarih Aralığı (Sağ Hizalı)</label>
              <input type="text" data-field="date" value="${escapeHtml(entry.date)}" placeholder="Örn: Sep 2023 – Present" />
            </div>
            <div class="form-group full-width">
              <label>Alt Başlık / Pozisyon / Bölüm & GPA & Şehir (İtalik Satır)</label>
              <input type="text" data-field="subtitle" value="${escapeHtml(entry.subtitle)}" placeholder="Örn: Bölüm / Pozisyon; GPA: X.XX/4.00 — Şehir, Ülke" />
            </div>
            <div class="form-group full-width">
              <label>Madde İşaretleri (Açıklamalar)</label>
              <div class="inline-items-list" data-role="bullets-list"></div>
              <button type="button" class="btn-add-sub" data-act="add-bullet">+ Madde İşareti (Bullet) Ekle</button>
            </div>
          </div>
        `;

        card.querySelector('[data-field="org"]').oninput = (e) => {
          entry.org = e.target.value;
          saveToStorage();
          renderPreview();
        };
        card.querySelector('[data-field="date"]').oninput = (e) => {
          entry.date = e.target.value;
          saveToStorage();
          renderPreview();
        };
        card.querySelector('[data-field="subtitle"]').oninput = (e) => {
          entry.subtitle = e.target.value;
          saveToStorage();
          renderPreview();
        };

        card.querySelector('[data-act="e-up"]').onclick = () => {
          if (entryIdx > 0) {
            const tmp = sec.entries[entryIdx - 1];
            sec.entries[entryIdx - 1] = sec.entries[entryIdx];
            sec.entries[entryIdx] = tmp;
            saveToStorage();
            renderEditor();
            renderPreview();
          }
        };
        card.querySelector('[data-act="e-down"]').onclick = () => {
          if (entryIdx < sec.entries.length - 1) {
            const tmp = sec.entries[entryIdx + 1];
            sec.entries[entryIdx + 1] = sec.entries[entryIdx];
            sec.entries[entryIdx] = tmp;
            saveToStorage();
            renderEditor();
            renderPreview();
          }
        };
        card.querySelector('[data-act="e-del"]').onclick = () => {
          sec.entries.splice(entryIdx, 1);
          saveToStorage();
          renderEditor();
          renderPreview();
        };

        const bulletsContainer = card.querySelector('[data-role="bullets-list"]');
        const renderBullets = () => {
          bulletsContainer.innerHTML = "";
          (entry.bullets || []).forEach((bText, bIdx) => {
            const row = document.createElement("div");
            row.className = "inline-item-row";
            row.innerHTML = `
              <input type="text" value="${escapeHtml(bText)}" placeholder="Açıklama maddesi yazın..." />
              <button type="button" class="icon-btn danger" title="Maddeyi Sil">✕</button>
            `;
            row.querySelector("input").oninput = (e) => {
              entry.bullets[bIdx] = e.target.value;
              saveToStorage();
              renderPreview();
            };
            row.querySelector("button").onclick = () => {
              entry.bullets.splice(bIdx, 1);
              saveToStorage();
              renderBullets();
              renderPreview();
            };
            bulletsContainer.appendChild(row);
          });
        };
        renderBullets();

        card.querySelector('[data-act="add-bullet"]').onclick = () => {
          entry.bullets = entry.bullets || [];
          entry.bullets.push("");
          saveToStorage();
          renderBullets();
          renderPreview();
        };

        bodyEl.appendChild(card);
      });

      const addEntryBtn = document.createElement("button");
      addEntryBtn.type = "button";
      addEntryBtn.className = "btn-add-sub";
      addEntryBtn.textContent = `+ "${sec.title}" Bölümüne Yeni Kayıt Ekle`;
      addEntryBtn.onclick = () => {
        sec.entries = sec.entries || [];
        sec.entries.push({
          org: "",
          date: "",
          subtitle: "",
          bullets: []
        });
        saveToStorage();
        renderEditor();
        renderPreview();
      };
      bodyEl.appendChild(addEntryBtn);

    } else if (sec.type === "list") {
      const listContainer = document.createElement("div");
      listContainer.className = "inline-items-list";

      (sec.items || []).forEach((itemText, itemIdx) => {
        const row = document.createElement("div");
        row.className = "inline-item-row";
        row.innerHTML = `
          <input type="text" value="${escapeHtml(itemText)}" placeholder="Örn: Sertifika Adı, Kurum — Açıklama (Tarih)" />
          <button type="button" class="icon-btn danger" title="Sil">✕</button>
        `;
        row.querySelector("input").oninput = (e) => {
          sec.items[itemIdx] = e.target.value;
          saveToStorage();
          renderPreview();
        };
        row.querySelector("button").onclick = () => {
          sec.items.splice(itemIdx, 1);
          saveToStorage();
          renderEditor();
          renderPreview();
        };
        listContainer.appendChild(row);
      });

      bodyEl.appendChild(listContainer);

      const addItemBtn = document.createElement("button");
      addItemBtn.type = "button";
      addItemBtn.className = "btn-add-sub";
      addItemBtn.textContent = "+ Yeni Sertifika / Madde Ekle";
      addItemBtn.onclick = () => {
        sec.items = sec.items || [];
        sec.items.push("");
        saveToStorage();
        renderEditor();
        renderPreview();
      };
      bodyEl.appendChild(addItemBtn);

    } else if (sec.type === "skills") {
      const skillsContainer = document.createElement("div");
      skillsContainer.className = "inline-items-list";

      (sec.skills || []).forEach((skillObj, sIdx) => {
        const row = document.createElement("div");
        row.className = "inline-item-row";
        row.innerHTML = `
          <input type="text" style="max-width: 150px; font-weight:600;" value="${escapeHtml(skillObj.label)}" placeholder="Başlık (Örn: Languages)" />
          <input type="text" value="${escapeHtml(skillObj.value)}" placeholder="Değer (Örn: Turkish (Native), English (C1))" />
          <button type="button" class="icon-btn danger" title="Sil">✕</button>
        `;
        const inputs = row.querySelectorAll("input");
        inputs[0].oninput = (e) => {
          skillObj.label = e.target.value;
          saveToStorage();
          renderPreview();
        };
        inputs[1].oninput = (e) => {
          skillObj.value = e.target.value;
          saveToStorage();
          renderPreview();
        };
        row.querySelector("button").onclick = () => {
          sec.skills.splice(sIdx, 1);
          saveToStorage();
          renderEditor();
          renderPreview();
        };
        skillsContainer.appendChild(row);
      });

      bodyEl.appendChild(skillsContainer);

      const addSkillBtn = document.createElement("button");
      addSkillBtn.type = "button";
      addSkillBtn.className = "btn-add-sub";
      addSkillBtn.textContent = "+ Yeni Yetenek / İlgi Alanı Satırı Ekle";
      addSkillBtn.onclick = () => {
        sec.skills = sec.skills || [];
        sec.skills.push({ label: "", value: "" });
        saveToStorage();
        renderEditor();
        renderPreview();
      };
      bodyEl.appendChild(addSkillBtn);
    }

    secEl.appendChild(bodyEl);
    container.appendChild(secEl);
  });
}

function renderExtraContactsEditor() {
  const listEl = document.getElementById("extraContactsList");
  listEl.innerHTML = "";
  (cvData.extraContacts || []).forEach((cVal, cIdx) => {
    const row = document.createElement("div");
    row.className = "inline-item-row";
    row.innerHTML = `
      <input type="text" value="${escapeHtml(cVal)}" placeholder="GitHub, Portfolyo veya Şehir..." />
      <button type="button" class="icon-btn danger" title="Sil">✕</button>
    `;
    row.querySelector("input").oninput = (e) => {
      cvData.extraContacts[cIdx] = e.target.value;
      saveToStorage();
      renderPreview();
    };
    row.querySelector("button").onclick = () => {
      cvData.extraContacts.splice(cIdx, 1);
      saveToStorage();
      renderExtraContactsEditor();
      renderPreview();
    };
    listEl.appendChild(row);
  });
}

// =====================================================
// 3. FILE READING (PDF & DOCX) + SMART CV PARSER
// =====================================================
async function extractTextFromPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF okuma kütüphanesi (PDF.js) yüklenemedi.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let allLines = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items = textContent.items
      .filter(it => it.str && it.str.trim() !== "")
      .map(it => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: it.width || 0
      }));

    items.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 4) return b.y - a.y;
      return a.x - b.x;
    });

    const lines = [];
    let currentLine = null;

    for (const item of items) {
      if (!currentLine || Math.abs(currentLine.y - item.y) > 4) {
        currentLine = { y: item.y, parts: [item] };
        lines.push(currentLine);
      } else {
        currentLine.parts.push(item);
      }
    }

    for (const ln of lines) {
      ln.parts.sort((a, b) => a.x - b.x);
      let lineStr = "";
      for (let i = 0; i < ln.parts.length; i++) {
        if (i > 0) {
          const prev = ln.parts[i - 1];
          const gap = ln.parts[i].x - (prev.x + prev.w);
          if (gap > 35) {
            lineStr += "\t";
          } else if (gap > 2 && !lineStr.endsWith(" ") && !ln.parts[i].str.startsWith(" ")) {
            lineStr += " ";
          }
        }
        lineStr += ln.parts[i].str;
      }
      allLines.push(lineStr.trim());
    }
  }

  return allLines.join("\n");
}

async function extractTextFromDocx(file) {
  if (!window.mammoth) {
    throw new Error("Word okuma kütüphanesi (Mammoth.js) yüklenemedi.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

const KNOWN_SECTION_HEADERS = [
  { regex: /^(EDUCATION|EĞİTİM|EGITIM|EĞİTİM BİLGİLERİ|ACADEMIC BACKGROUND)$/i, title: "EDUCATION", type: "detailed" },
  { regex: /^(PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT|İŞ DENEYİMİ|IS DENEYIMI|DENEYİM|DENEYIM|STAJ VE İŞ DENEYİMİ|INTERNSHIPS)$/i, title: "PROFESSIONAL EXPERIENCE", type: "detailed" },
  { regex: /^(LEADERSHIP\s*&\s*EXTRACURRICULAR ACTIVITIES|LEADERSHIP|EXTRACURRICULAR ACTIVITIES|ACTIVITIES|ORGANIZATIONS|TOPLULUKLAR|LİDERLİK VE KULÜP AKTİVİTELERİ|SOSYAL AKTİVİTELER|KULÜP VE TOPLULUKLAR)$/i, title: "LEADERSHIP & EXTRACURRICULAR ACTIVITIES", type: "detailed" },
  { regex: /^(VOLUNTEER EXPERIENCE|VOLUNTEERING|COMMUNITY SERVICE|GÖNÜLLÜLÜK|GÖNÜLLÜ ÇALIŞMALAR|SOSYAL SORUMLULUK PROJELERİ|SOSYAL SORUMLULUK)$/i, title: "VOLUNTEER EXPERIENCE", type: "detailed" },
  { regex: /^(PROJECTS|RESEARCH|PUBLICATIONS|PROJELER|ARAŞTIRMALAR|YAYINLAR|AKADEMİK PROJELER)$/i, title: null, type: "detailed" },
  { regex: /^(CERTIFICATIONS|CERTIFICATES|LICENSES\s*&\s*CERTIFICATIONS|COURSES|HONORS\s*&\s*AWARDS|AWARDS|SERTİFİKALAR|KURSLAR VE SERTİFİKALAR|BAŞARILAR VE ÖDÜLLER|ÖDÜLLER)$/i, title: "CERTIFICATIONS", type: "list" },
  { regex: /^(SKILLS\s*&\s*INTERESTS|SKILLS|TECHNICAL SKILLS|ADDITIONAL INFORMATION|LANGUAGES\s*&\s*SKILLS|YETENEKLER VE İLGİ ALANLARI|YETENEKLER|BECERİLER|DİLLER VE YETENEKLER)$/i, title: "SKILLS & INTERESTS", type: "skills" }
];

const MONTHS_PATTERN = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Oca(?:k)?|Şub(?:at)?|Sub(?:at)?|Mar(?:t)?|Nis(?:an)?|May(?:ıs)?|Haz(?:iran)?|Tem(?:muz)?|Ağu(?:stos)?|Agu(?:stos)?|Eyl(?:ül)?|Eki(?:m)?|Kas(?:ım)?|Ara(?:lık)?|\\d{1,2}\\/)";
const DATE_RANGE_END_REGEX = new RegExp(
  `(?:\\t|\\s{2,}|\\s+)((?:${MONTHS_PATTERN}\\s*\\d{4}|\\d{4})\\s*[–—\\-]\\s*(?:${MONTHS_PATTERN}\\s*\\d{4}|\\d{4}|Present|Current|Ongoing|Devam(?:\\s*Ediyor)?|Halen)?|(?:${MONTHS_PATTERN}\\s*\\d{4}))\\s*$`,
  "i"
);

function detectSectionHeader(line) {
  const clean = line.replace(/[:_—\-]+$/, "").trim();
  if (!clean || clean.length > 65) return null;

  for (const def of KNOWN_SECTION_HEADERS) {
    if (def.regex.test(clean)) {
      return {
        title: def.title || clean.toUpperCase(),
        type: def.type
      };
    }
  }
  return null;
}

function splitOrgAndDate(line) {
  if (line.includes("\t")) {
    const parts = line.split("\t").map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      if (/\d{4}|Present|Devam/i.test(lastPart) && lastPart.length <= 35) {
        return {
          org: parts.slice(0, -1).join(" "),
          date: lastPart
        };
      }
    }
  }

  const match = line.match(DATE_RANGE_END_REGEX);
  if (match && match.index > 2) {
    const orgPart = line.slice(0, match.index).trim();
    const datePart = match[1].trim();
    if (!orgPart.endsWith("(") && orgPart.length < 110) {
      return {
        org: orgPart,
        date: datePart
      };
    }
  }

  return null;
}

function parseRawCvTextToData(rawText) {
  const result = {
    fullName: "",
    emailPrimary: "",
    emailSecondary: "",
    phone: "",
    linkedin: "",
    extraContacts: [],
    sections: []
  };

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/\u00A0/g, " ").trim())
    .filter(l => l !== "");

  if (lines.length === 0) return result;

  const headerLines = [];
  let bodyStartIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    if (detectSectionHeader(lines[i])) {
      bodyStartIdx = i;
      break;
    }
    if (i < 6) {
      headerLines.push(lines[i]);
      bodyStartIdx = i + 1;
    } else {
      break;
    }
  }

  const headerBlob = headerLines.join(" | ");

  const emails = headerBlob.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  if (emails[0]) result.emailPrimary = emails[0];
  if (emails[1]) result.emailSecondary = emails[1];

  const linkedinMatch = headerBlob.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s|,;]+/i);
  if (linkedinMatch) {
    result.linkedin = linkedinMatch[0];
  }

  const phoneMatch = headerBlob.match(/(?:\(\+?\d{1,4}\)|\+\d{1,3})?[\s.-]*\d{3}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0].trim();
  }

  for (const hLine of headerLines) {
    if (!hLine.includes("@") && !/linkedin\.com/i.test(hLine) && !/\d{3}\s*\d{2}\s*\d{2}/.test(hLine)) {
      result.fullName = hLine.replace(/\|/g, "").trim();
      break;
    }
  }

  let currentSec = null;
  let currentEntry = null;

  for (let i = bodyStartIdx; i < lines.length; i++) {
    const line = lines[i];
    const secHeader = detectSectionHeader(line);

    if (secHeader) {
      currentSec = {
        id: "sec-" + Date.now() + "-" + i,
        title: secHeader.title,
        type: secHeader.type,
        entries: secHeader.type === "detailed" ? [] : undefined,
        items: secHeader.type === "list" ? [] : undefined,
        skills: secHeader.type === "skills" ? [] : undefined
      };
      result.sections.push(currentSec);
      currentEntry = null;
      continue;
    }

    if (!currentSec) {
      currentSec = {
        id: "sec-exp-auto",
        title: "EXPERIENCE & EDUCATION",
        type: "detailed",
        entries: []
      };
      result.sections.push(currentSec);
    }

    if (currentSec.type === "list") {
      const cleanBullet = line.replace(/^[•\-*▪‣]\s*/, "").trim();
      if (cleanBullet) {
        currentSec.items.push(cleanBullet);
      }
    } else if (currentSec.type === "skills") {
      const cleanLine = line.replace(/^[•\-*▪‣]\s*/, "").trim();
      const colonIdx = cleanLine.indexOf(":");
      if (colonIdx > 0 && colonIdx < 35) {
        currentSec.skills.push({
          label: cleanLine.slice(0, colonIdx).trim(),
          value: cleanLine.slice(colonIdx + 1).trim()
        });
      } else if (cleanLine) {
        currentSec.skills.push({
          label: "",
          value: cleanLine
        });
      }
    } else if (currentSec.type === "detailed") {
      const isExplicitBullet = /^[•\-*▪‣]\s+/.test(line);
      const orgDate = !isExplicitBullet ? splitOrgAndDate(line) : null;

      if (orgDate) {
        currentEntry = {
          org: orgDate.org,
          date: orgDate.date,
          subtitle: "",
          bullets: []
        };
        currentSec.entries.push(currentEntry);
      } else if (isExplicitBullet) {
        const bulletText = line.replace(/^[•\-*▪‣]\s+/, "").trim();
        if (!currentEntry) {
          currentEntry = { org: "", date: "", subtitle: "", bullets: [] };
          currentSec.entries.push(currentEntry);
        }
        currentEntry.bullets.push(bulletText);
      } else {
        if (!currentEntry) {
          currentEntry = {
            org: line,
            date: "",
            subtitle: "",
            bullets: []
          };
          currentSec.entries.push(currentEntry);
        } else if (!currentEntry.subtitle && currentEntry.bullets.length === 0) {
          currentEntry.subtitle = line;
        } else {
          const prevBulletIdx = currentEntry.bullets.length - 1;
          if (
            prevBulletIdx >= 0 &&
            !/[.!?;]$/.test(currentEntry.bullets[prevBulletIdx]) &&
            /^[a-zğüşıöç(]/.test(line)
          ) {
            currentEntry.bullets[prevBulletIdx] += " " + line;
          } else {
            currentEntry.bullets.push(line);
          }
        }
      }
    }
  }

  return result;
}

async function parseWithGeminiAI(rawText, apiKey) {
  const prompt = `Aşağıdaki CV metnini analiz et ve verilen JSON şemasına tam uygun olarak ayrıştır. 
Bölüm başlıklarını orijinal dilinde (İngilizce ise EDUCATION, PROFESSIONAL EXPERIENCE vb., Türkçe ise EĞİTİM, İŞ DENEYİMİ vb.) büyük harfle koru.
CV Metni:
"""
${rawText}
"""`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              fullName: { type: "STRING" },
              emailPrimary: { type: "STRING" },
              emailSecondary: { type: "STRING" },
              phone: { type: "STRING" },
              linkedin: { type: "STRING" },
              extraContacts: { type: "ARRAY", items: { type: "STRING" } },
              sections: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    type: { type: "STRING", enum: ["detailed", "list", "skills"] },
                    entries: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          org: { type: "STRING" },
                          date: { type: "STRING" },
                          subtitle: { type: "STRING" },
                          bullets: { type: "ARRAY", items: { type: "STRING" } }
                        }
                      }
                    },
                    items: { type: "ARRAY", items: { type: "STRING" } },
                    skills: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          label: { type: "STRING" },
                          value: { type: "STRING" }
                        }
                      }
                    }
                  },
                  required: ["title", "type"]
                }
              }
            },
            required: ["fullName", "sections"]
          }
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Gemini API hatası: " + errText);
  }

  const json = await response.json();
  const textOut = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOut) throw new Error("Gemini API boş yanıt döndürdü.");
  return JSON.parse(textOut);
}

// =====================================================
// 4. WORD (.DOCX) EXPORT
// =====================================================
async function exportToWordDocx() {
  if (!window.docx) {
    alert("Word kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.");
    return;
  }

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    TabStopType,
    BorderStyle
  } = window.docx;

  const RIGHT_TAB_POS = 10178;
  const FONT_NAME = "Times New Roman";

  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: (cvData.fullName || "AD SOYAD").toUpperCase(),
          bold: true,
          size: 32,
          font: FONT_NAME
        })
      ]
    })
  );

  const cleanContacts = getAllContactItems();
  if (cleanContacts.length > 0) {
    const contactRuns = [];
    cleanContacts.forEach((c, idx) => {
      contactRuns.push(
        new TextRun({
          text: c.trim(),
          size: 19,
          font: FONT_NAME
        })
      );
      if (idx < cleanContacts.length - 1) {
        contactRuns.push(
          new TextRun({
            text: "  |  ",
            size: 19,
            font: FONT_NAME
          })
        );
      }
    });

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: contactRuns
      })
    );
  }

  (cvData.sections || []).forEach(sec => {
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 80 },
        border: {
          bottom: {
            color: "000000",
            space: 2,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        children: [
          new TextRun({
            text: (sec.title || "").toUpperCase(),
            bold: true,
            size: 21,
            font: FONT_NAME
          })
        ]
      })
    );

    if (sec.type === "detailed") {
      (sec.entries || []).forEach(entry => {
        const hasAnyContent =
          (entry.org && entry.org.trim()) ||
          (entry.date && entry.date.trim()) ||
          (entry.subtitle && entry.subtitle.trim()) ||
          (entry.bullets || []).some(b => b && b.trim());

        if (!hasAnyContent) return;

        children.push(
          new Paragraph({
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: RIGHT_TAB_POS
              }
            ],
            spacing: { before: 40, after: 20 },
            children: [
              new TextRun({
                text: entry.org || "",
                bold: true,
                size: 21,
                font: FONT_NAME
              }),
              new TextRun({
                text: `\t${entry.date || ""}`,
                size: 21,
                font: FONT_NAME
              })
            ]
          })
        );

        if (entry.subtitle && entry.subtitle.trim() !== "") {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: entry.subtitle,
                  italics: true,
                  size: 21,
                  font: FONT_NAME
                })
              ]
            })
          );
        }

        const bullets = (entry.bullets || []).filter(b => b && b.trim() !== "");
        bullets.forEach(b => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: b,
                  size: 21,
                  font: FONT_NAME
                })
              ]
            })
          );
        });
      });
    } else if (sec.type === "list") {
      const items = (sec.items || []).filter(i => i && i.trim() !== "");
      items.forEach(item => {
        const commaIdx = item.indexOf(",");
        let runs = [];
        if (commaIdx > 0 && commaIdx < 45) {
          runs = [
            new TextRun({
              text: item.slice(0, commaIdx),
              bold: true,
              size: 21,
              font: FONT_NAME
            }),
            new TextRun({
              text: item.slice(commaIdx),
              size: 21,
              font: FONT_NAME
            })
          ];
        } else {
          runs = [
            new TextRun({
              text: item,
              size: 21,
              font: FONT_NAME
            })
          ];
        }

        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: runs
          })
        );
      });
    } else if (sec.type === "skills") {
      const skills = (sec.skills || []).filter(s => (s.label && s.label.trim()) || (s.value && s.value.trim()));
      skills.forEach(s => {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: s.label ? `${s.label}:  ` : "",
                bold: true,
                size: 21,
                font: FONT_NAME
              }),
              new TextRun({
                text: s.value || "",
                size: 21,
                font: FONT_NAME
              })
            ]
          })
        );
      });
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 864,
              bottom: 720,
              left: 864
            }
          }
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const safeName = (cvData.fullName || "CV").trim().replace(/\s+/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}_CV.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("📄 Word (.docx) dosyanız indirildi!");
}

// =====================================================
// 5. DIRECT PDF DOWNLOAD & VECTOR PRINT PDF
// =====================================================
function exportDirectPdf() {
  const element = document.getElementById("cvPage");
  const safeName = (cvData.fullName || "CV").trim().replace(/\s+/g, "_");

  if (!window.html2pdf) {
    window.print();
    return;
  }

  showToast("⏳ PDF hazırlanıyor...");
  const opt = {
    margin: 0,
    filename: `${safeName}_CV.pdf`,
    image: { type: "jpeg", quality: 0.99 },
    html2canvas: { scale: 2.5, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    showToast("✅ PDF dosyanız indirildi!");
  });
}

// =====================================================
// 6. INITIALIZATION & EVENT LISTENERS
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  renderEditor();
  renderPreview();

  // Add Extra Contact
  document.getElementById("btnAddContact").onclick = () => {
    cvData.extraContacts = cvData.extraContacts || [];
    cvData.extraContacts.push("");
    saveToStorage();
    renderExtraContactsEditor();
    renderPreview();
  };

  // Add Custom Section
  document.getElementById("btnAddSection").onclick = () => {
    const typeChoice = prompt(
      "Bölüm tipini seçin:\n1 = Detaylı (Kurum, Tarih, Alt Başlık, Maddeler - Örn: Deneyim/Eğitim)\n2 = Liste (Sertifikalar / Ödüller)\n3 = Kategori: Değer (Yetenekler / Diller)",
      "1"
    );
    if (!typeChoice) return;

    if (typeChoice.trim() === "2") {
      cvData.sections.push({
        id: "sec-" + Date.now(),
        title: "NEW SECTION",
        type: "list",
        items: [""]
      });
    } else if (typeChoice.trim() === "3") {
      cvData.sections.push({
        id: "sec-" + Date.now(),
        title: "ADDITIONAL SKILLS",
        type: "skills",
        skills: [{ label: "", value: "" }]
      });
    } else {
      cvData.sections.push({
        id: "sec-" + Date.now(),
        title: "PROJECTS & RESEARCH",
        type: "detailed",
        entries: [
          {
            org: "",
            date: "",
            subtitle: "",
            bullets: [""]
          }
        ]
      });
    }
    saveToStorage();
    renderEditor();
    renderPreview();
    showToast("✨ Yeni bölüm eklendi");
  };

  // Clear / Reset All Data
  document.getElementById("btnClearAll").onclick = () => {
    if (confirm("Tüm alanları sıfırlayıp temiz bir CV şablonuna geçmek istiyor musunuz?")) {
      cvData = structuredClone(DEFAULT_CV_DATA);
      saveToStorage();
      renderEditor();
      renderPreview();
      showToast("🧹 Tüm alanlar sıfırlandı");
    }
  };

  // Font Family, Size & Line Height Selectors
  const fontSelect = document.getElementById("fontFamilySelect");
  const sizeSelect = document.getElementById("fontSizeSelect");
  const lineHeightSelect = document.getElementById("lineHeightSelect");

  fontSelect.onchange = (e) => {
    document.documentElement.style.setProperty("--cv-font", e.target.value);
    updatePageFillMeter();
  };
  sizeSelect.onchange = (e) => {
    document.documentElement.style.setProperty("--cv-size", e.target.value);
    updatePageFillMeter();
  };
  lineHeightSelect.onchange = (e) => {
    document.documentElement.style.setProperty("--cv-line-height", e.target.value);
    updatePageFillMeter();
  };

  // Zoom Controls
  const zoomLabel = document.getElementById("zoomValLabel");
  function applyZoom(val) {
    currentZoom = Math.max(0.65, Math.min(1.35, val));
    document.documentElement.style.setProperty("--cv-zoom", currentZoom);
    if (zoomLabel) zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  document.getElementById("btnZoomOut").onclick = () => applyZoom(currentZoom - 0.1);
  document.getElementById("btnZoomIn").onclick = () => applyZoom(currentZoom + 0.1);
  document.getElementById("btnZoomReset").onclick = () => applyZoom(1);

  // Export Buttons
  document.getElementById("btnPrintPdf").onclick = () => {
    window.print();
  };

  document.getElementById("btnDirectPdf").onclick = () => {
    exportDirectPdf();
  };

  document.getElementById("btnDownloadDocx").onclick = () => {
    exportToWordDocx();
  };

  // =====================================================
  // CV IMPORT MODAL LOGIC
  // =====================================================
  const modalOverlay = document.getElementById("importModalOverlay");
  const btnOpenImportModal = document.getElementById("btnOpenImportModal");
  const btnOpenImportBanner = document.getElementById("btnOpenImportBanner");
  const btnCloseImportModal = document.getElementById("btnCloseImportModal");
  const btnCancelImport = document.getElementById("btnCancelImport");
  const btnProcessImport = document.getElementById("btnProcessImport");
  const cvFileInput = document.getElementById("cvFileInput");
  const dropZone = document.getElementById("dropZone");
  const rawCvTextarea = document.getElementById("rawCvTextarea");
  const selectedFileBadge = document.getElementById("selectedFileBadge");
  const importStatusMsg = document.getElementById("importStatusMsg");
  const geminiApiKeyInput = document.getElementById("geminiApiKeyInput");

  function showStatus(msg, type = "info") {
    importStatusMsg.textContent = msg;
    importStatusMsg.className = `import-status ${type}`;
  }

  function openImportModal() {
    importStatusMsg.className = "import-status hidden";
    modalOverlay.classList.remove("hidden");
  }

  function closeImportModal() {
    modalOverlay.classList.add("hidden");
  }

  btnOpenImportModal.onclick = openImportModal;
  btnOpenImportBanner.onclick = openImportModal;
  btnCloseImportModal.onclick = closeImportModal;
  btnCancelImport.onclick = closeImportModal;

  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeImportModal();
  };

  async function handleUploadedFile(file) {
    if (!file) return;
    selectedFileBadge.textContent = `✓ Seçilen Dosya: ${file.name}`;
    selectedFileBadge.classList.remove("hidden");
    showStatus("Dosya okunuyor, lütfen bekleyin...", "info");

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let extractedText = "";

      if (ext === "pdf") {
        extractedText = await extractTextFromPdf(file);
      } else if (ext === "docx") {
        extractedText = await extractTextFromDocx(file);
      } else if (ext === "txt") {
        extractedText = await file.text();
      } else {
        throw new Error("Lütfen .pdf, .docx veya .txt uzantılı bir dosya seçin.");
      }

      rawCvTextarea.value = extractedText;
      showStatus(
        "Dosya metni başarıyla okundu! Şimdi 'Bilgileri Çek ve Forma Doldur' butonuna tıklayabilirsiniz.",
        "success"
      );
    } catch (err) {
      console.error(err);
      showStatus("Dosya okunurken hata oluştu: " + err.message, "error");
    }
  }

  cvFileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  };
  dropZone.ondragleave = () => {
    dropZone.classList.remove("drag-over");
  };
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  btnProcessImport.onclick = async () => {
    const rawText = rawCvTextarea.value.trim();
    if (!rawText) {
      showStatus("Lütfen önce bir PDF/Word dosyası yükleyin veya CV metninizi kutuya yapıştırın.", "error");
      return;
    }

    const apiKey = geminiApiKeyInput.value.trim();
    btnProcessImport.disabled = true;

    try {
      let parsedData = null;

      if (apiKey) {
        showStatus("Yapay Zeka (Gemini) ile CV bilgileri ayrıştırılıyor...", "info");
        parsedData = await parseWithGeminiAI(rawText, apiKey);
      } else {
        showStatus("Akıllı CV ayrıştırıcı ile bilgiler çekiliyor...", "info");
        parsedData = parseRawCvTextToData(rawText);
      }

      if (parsedData && parsedData.sections && parsedData.sections.length > 0) {
        cvData = {
          fullName: parsedData.fullName || "",
          emailPrimary: parsedData.emailPrimary || "",
          emailSecondary: parsedData.emailSecondary || "",
          phone: parsedData.phone || "",
          linkedin: parsedData.linkedin || "",
          extraContacts: parsedData.extraContacts || [],
          sections: parsedData.sections
        };
        saveToStorage();
        renderEditor();
        renderPreview();
        closeImportModal();
        showToast("🎉 CV bilgileri başarıyla çekildi ve forma yerleştirildi!");
      } else {
        showStatus("CV metninden bölüm çıkarılamadı. Lütfen metni kontrol edin.", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus("Ayrıştırma hatası: " + err.message, "error");
    } finally {
      btnProcessImport.disabled = false;
    }
  };
});
