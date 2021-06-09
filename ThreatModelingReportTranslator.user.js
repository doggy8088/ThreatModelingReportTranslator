// ==UserScript==
// @name         ThreatModelingReportTranslator
// @namespace    https://blog.miniasp.com/
// @version      0.1
// @description  A Tampermonkey Userscript that translate Threat Modeling Report into Traditional Chinese from Microsoft Threat Modeling Tool (latest version).
// @author       Will 保哥
// @source       https://github.com/doggy8088/ThreatModelingReportTranslator
// @match        *://*/*
// @match        file:///*:/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    if (document.title !== 'Threat Modeling Report') {
        return;
    }

    document.addEventListener('keydown', (ev) => {
        if (ev.altKey && ev.key === 's' && !/^(?:input|select|textarea|button)$/i.test(ev.target.nodeName)) {
            document.body.translating = !document.body.translating;
            loop(document.body);
        }
    });

    let mappings = [

        // Title
        { from: 'Threat Modeling Report', to: '威脅模型報告' },

        // Meta
        { from: /Created on (\d{4}\/\d{1,2}\/\d{1,2} .*)/, to: '建立時間: $1' },
        { from: 'Threat Model Name',     to: '模型名稱' },
        { from: 'Owner',                 to: '　擁有人' },
        { from: 'Reviewer',              to: '　審閱人' },
        { from: 'Contributors',          to: '　貢獻者' },
        { from: 'Assumptions',           to: '假設條件' },
        { from: 'External Dependencies', to: '外部相依' },

        // Threat Model Summary
        { from: 'Threat Model Summary',   to: '威脅模型摘要' },
        { from: 'Not Started',            to: '尚未開始' },
        { from: 'Not Applicable',         to: '不適用' },
        { from: 'Needs Investigation',    to: '需要研究' },
        { from: 'Mitigation Implemented', to: '已實施緩解措施' },
        { from: 'Total Migrated',         to: '實施總計' },
        { from: 'Total',                  to: '項目總計' },

        // Diagram Summary
        { from: 'Diagram Summary',        to: '圖表摘要' },
        { from: 'Diagram:',               to: '圖表:' },
        { from: 'Interaction:',           to: '互動方式:' },
        // { from: 'Generic Data Flow',   to: '一般資料流程' },

        // Mitigations
        { from: 'Category',      to: '類　　別' },
        { from: 'Description',   to: '描　　述' },
        { from: 'Justification', to: '防護方式' },
        { from: 'State:',        to: '狀態:'   },
        { from: 'Priority:',     to: '優先權:' },

        // STRIDE model
        // https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats?WT.mc_id=DT-MVP-4015686
        { from: /^Spoofing$/g,               to: '偽冒攻擊' },
        { from: /^Tampering$/g,              to: '竄改攻擊' },
        { from: /^Repudiation$/g,            to: '否認性'  },
        { from: /^Information Disclosure$/g, to: '洩漏資訊' },
        { from: /^Denial Of Service$/g,      to: '阻斷服務' },
        { from: /^Elevation Of Privilege$/g, to: '特權提升' },

        // Justification
        { from: /no mitigation provided/g, to: '沒有可提供的緩解措施，請開發人員自行注意' },
    ];

    function loop(node) {
        var nodes = node.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            /** @type {Node} */ let no = nodes[i];
            // console.log(`NodeName: ${no.nodeName}, NodeType: ${no.nodeType}`);
            if (no.hasChildNodes()) {
                loop(no);
            } else {
                if (no.nodeType === Node.TEXT_NODE) {
                    // 備份原文，方便日後轉換回來
                    if (!no.parentElement.origText) no.parentElement.origText = no.nodeValue;

                    if (document.body.translating) {
                        no.nodeValue = translate(no.nodeValue);
                        no.parentElement.style.whiteSpace = 'nowrap';
                        // console.log(`1 - NodeName: ${no.nodeName}, NodeType: ${no.nodeType}, NodeValue: `, no.nodeValue);
                    } else {
                        no.nodeValue = no.parentElement.origText;
                        // console.log(`2 - NodeName: ${no.nodeName}, NodeType: ${no.nodeType}, NodeValue: `, no.parentElement.origText);
                    }
                }
            }
        }
    }

    function translate(text = '') {
        return mappings.reduce((accu, curr) => accu.replace(curr.from, curr.to), text);
    }

})();
