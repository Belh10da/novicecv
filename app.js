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

// Remove legacy personal sample storage key if present
try {
  localStorage.removeItem("harvard_cv_maker_data_v1");
} catch (e) {}

let cvData = loadFromStorage() || structuredClone(DEFAULT_CV_DATA);

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
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

// Helper to gather all filled contact items in order
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

// =====================================================
// 1. RENDER LIVE A4 PREVIEW
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

  (cvData.sections || []).forEach(sec => {
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
      <div class="cv-section">
        <div class="cv-section-title">${escapeHtml(sec.title)}</div>
        ${bodyHtml}
      </div>
    `;
  });

  page.innerHTML = `
    <div class="cv-header" title="Düzenlemek için tıklayın" style="cursor:pointer;">
      <div class="cv-name">${escapeHtml(displayName)}</div>
      <div class="cv-contact">${contactsHtml}</div>
    </div>
    ${sectionsHtml}
  `;

  const headerEl = page.querySelector(".cv-header");
  if (headerEl) {
    headerEl.onclick = () => {
      const fnInput = document.getElementById("fullName");
      if (fnInput) {
        fnInput.scrollIntoView({ behavior: "smooth", block: "center" });
        fnInput.focus();
      }
    };
  }
}

// =====================================================
// 2. RENDER LEFT FORM EDITOR
// =====================================================
function renderEditor() {
  // Personal & Contact Inputs
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

  // Extra Contacts List
  renderExtraContactsEditor();

  // Dynamic Sections
  const container = document.getElementById("sectionsEditorContainer");
  container.innerHTML = "";

  cvData.sections.forEach((sec, secIdx) => {
    const secEl = document.createElement("div");
    secEl.className = "form-section";

    // Header with editable section title and up/down/delete actions
    const headerEl = document.createElement("div");
    headerEl.className = "section-header";
    headerEl.innerHTML = `
      <input type="text" class="section-title-input" value="${escapeHtml(sec.title)}" placeholder="BÖLÜM BAŞLIĞI (Örn: EDUCATION)" />
      <div class="section-header-actions">
        <button type="button" class="icon-btn" title="Yukarı Taşı" data-action="up">▲</button>
        <button type="button" class="icon-btn" title="Aşağı Taşı" data-action="down">▼</button>
        <button type="button" class="icon-btn danger" title="Bölümü Sil" data-action="delete">✕</button>
      </div>
    `;

    const titleInput = headerEl.querySelector(".section-title-input");
    titleInput.oninput = (e) => {
      sec.title = e.target.value;
      saveToStorage();
      renderPreview();
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

    // Body based on section type
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

        // Inputs bindings
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

        // Entry up/down/delete
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

        // Bullets list
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
// 3. WORD (.DOCX) EXPORT
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

  // 1. Full Name (Centered, 16pt Bold)
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

  // 2. Contact Info Line (Centered, 9.5pt)
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

  // 3. Sections
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
}

// =====================================================
// 4. DIRECT PDF DOWNLOAD & VECTOR PRINT PDF
// =====================================================
function exportDirectPdf() {
  const element = document.getElementById("cvPage");
  const safeName = (cvData.fullName || "CV").trim().replace(/\s+/g, "_");

  if (!window.html2pdf) {
    window.print();
    return;
  }

  const opt = {
    margin: 0,
    filename: `${safeName}_CV.pdf`,
    image: { type: "jpeg", quality: 0.99 },
    html2canvas: { scale: 2.5, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(element).save();
}

// =====================================================
// 5. INITIALIZATION & EVENT LISTENERS
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
  };

  // Clear / Reset All Data
  document.getElementById("btnClearAll").onclick = () => {
    if (confirm("Tüm alanları sıfırlayıp temiz bir CV şablonuna geçmek istiyor musunuz?")) {
      cvData = structuredClone(DEFAULT_CV_DATA);
      saveToStorage();
      renderEditor();
      renderPreview();
    }
  };

  // Font Family & Size Selectors
  const fontSelect = document.getElementById("fontFamilySelect");
  const sizeSelect = document.getElementById("fontSizeSelect");

  fontSelect.onchange = (e) => {
    document.documentElement.style.setProperty("--cv-font", e.target.value);
  };
  sizeSelect.onchange = (e) => {
    document.documentElement.style.setProperty("--cv-size", e.target.value);
  };

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
});
