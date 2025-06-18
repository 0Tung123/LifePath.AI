(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const StoryHistoryPanel = ({ storyHistory, knowledgeBase, onLoreClick, isLoading = false })=>{
    _s();
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tooltip, setTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        visible: false,
        content: "",
        x: 0,
        y: 0
    });
    // Auto scroll to bottom when new content is added
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoryHistoryPanel.useEffect": ()=>{
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }["StoryHistoryPanel.useEffect"], [
        storyHistory
    ]);
    // Content type detection functions
    const detectContentType = (text)=>{
        const segments = [];
        const lines = text.split("\n").filter((line)=>line.trim());
        for (const line of lines){
            const trimmedLine = line.trim();
            // System messages
            if (trimmedLine.match(/^\[Hệ Thống\]|^\[System\]|^✨|^📊|^🎯/)) {
                segments.push({
                    type: "system",
                    content: trimmedLine
                });
                continue;
            }
            // Dialogue detection (quotes or speaker patterns)
            // Pattern 1: "Speaker: 'dialogue'" or "Speaker: "dialogue""
            const speakerDialogueMatch = trimmedLine.match(/^([^:"]+):\s*["']([^"']*)["']$/);
            if (speakerDialogueMatch) {
                const speaker = speakerDialogueMatch[1]?.trim();
                const dialogue = speakerDialogueMatch[2];
                segments.push({
                    type: "dialogue",
                    content: dialogue,
                    speaker: speaker
                });
                continue;
            }
            // Pattern 2: Just quoted text ""dialogue"" or 'dialogue'
            const quotedTextMatch = trimmedLine.match(/^["']([^"']*)["']$/);
            if (quotedTextMatch) {
                const dialogue = quotedTextMatch[1];
                segments.push({
                    type: "dialogue",
                    content: dialogue,
                    speaker: undefined
                });
                continue;
            }
            // Internal monologue (italic markers or thought patterns)
            if (trimmedLine.match(/^\*.*\*$|^_.*_$|nghĩ thầm|tự nhủ|trong lòng/i)) {
                segments.push({
                    type: "monologue",
                    content: trimmedLine.replace(/^\*|\*$|^_|_$/g, "").trim()
                });
                continue;
            }
            // Item detection (brackets or item keywords)
            const itemMatch = trimmedLine.match(/\[([^\]]+)\]|\b(kiếm|đao|giáp|bùa|thuốc|đan|thạch|ngọc|châu|bảo)\b/i);
            if (itemMatch) {
                segments.push({
                    type: "item",
                    content: trimmedLine,
                    itemRarity: detectItemRarity(trimmedLine)
                });
                continue;
            }
            // Action detection (action verbs or movement)
            if (trimmedLine.match(/\b(đi|chạy|nhảy|tấn công|phòng thủ|sử dụng|cầm|lấy|mở|đóng|nói|hét|thì thầm)\b/i)) {
                segments.push({
                    type: "action",
                    content: trimmedLine
                });
                continue;
            }
            // Default to description
            segments.push({
                type: "description",
                content: trimmedLine
            });
        }
        return segments;
    };
    const detectItemRarity = (text)=>{
        if (text.match(/huyền thoại|legendary|vàng kim/i)) return "legendary";
        if (text.match(/sử thi|epic|tím|violet/i)) return "epic";
        if (text.match(/hiếm|rare|xanh lam|blue/i)) return "rare";
        if (text.match(/tốt|good|xanh lục|green/i)) return "good";
        return "common";
    };
    // Tooltip functions
    const showTooltip = (content, event)=>{
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            content,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };
    const hideTooltip = ()=>{
        setTooltip((prev)=>({
                ...prev,
                visible: false
            }));
    };
    // Function to get character color based on name
    const getCharacterColor = (speakerName)=>{
        // Predefined colors for common character types
        const colorMap = {
            // Main character variations
            bạn: "text-emerald-400",
            tôi: "text-emerald-400",
            ta: "text-emerald-400",
            // Elder/Master titles
            "trưởng lão": "text-amber-400",
            "sư phụ": "text-amber-400",
            thầy: "text-amber-400",
            "sư tổ": "text-amber-400",
            // System/Narrator
            "hệ thống": "text-cyan-400",
            "người kể": "text-gray-400",
            narrator: "text-gray-400"
        };
        // Check for predefined mappings first
        const lowerName = speakerName.toLowerCase();
        for (const [key, color] of Object.entries(colorMap)){
            if (lowerName.includes(key)) {
                return color;
            }
        }
        // Generate consistent color based on name hash
        const colors = [
            "text-blue-400",
            "text-purple-400",
            "text-pink-400",
            "text-rose-400",
            "text-orange-400",
            "text-yellow-400",
            "text-lime-400",
            "text-green-400",
            "text-teal-400",
            "text-sky-400",
            "text-indigo-400",
            "text-violet-400"
        ];
        // Simple hash function for consistent color assignment
        let hash = 0;
        for(let i = 0; i < speakerName.length; i++){
            hash = (hash << 5) - hash + speakerName.charCodeAt(i) & 0xffffffff;
        }
        return colors[Math.abs(hash) % colors.length];
    };
    // Function to highlight lore items in text
    const highlightLoreItems = (text)=>{
        if (!knowledgeBase || knowledgeBase.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: text
            }, void 0, false, {
                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                lineNumber: 220,
                columnNumber: 14
            }, this);
        }
        // const highlightedText = text;
        const loreItems = [];
        // Create regex patterns for each lore item
        knowledgeBase.forEach((item)=>{
            const regex = new RegExp(`\\b${item.name}\\b`, "gi");
            loreItems.push({
                item,
                regex
            });
        });
        // Sort by name length (longest first) to avoid partial matches
        loreItems.sort((a, b)=>b.item.name.length - a.item.name.length);
        const parts = [];
        let lastIndex = 0;
        // Find all matches
        const matches = [];
        loreItems.forEach(({ item, regex })=>{
            let match;
            while((match = regex.exec(text)) !== null){
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    item
                });
            }
        });
        // Sort matches by position
        matches.sort((a, b)=>a.start - b.start);
        // Remove overlapping matches (keep the first one)
        const filteredMatches = matches.filter((match, index)=>{
            for(let i = 0; i < index; i++){
                const prevMatch = matches[i];
                if (match.start < prevMatch.end && match.end > prevMatch.start) {
                    return false;
                }
            }
            return true;
        });
        // Build the highlighted text
        filteredMatches.forEach((match, index)=>{
            // Add text before the match
            if (match.start > lastIndex) {
                parts.push(text.slice(lastIndex, match.start));
            }
            // Add the highlighted match
            const matchText = text.slice(match.start, match.end);
            parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onLoreClick(match.item),
                onMouseEnter: (e)=>showTooltip(match.item.description || `Chi tiết về ${match.item.name}`, e),
                onMouseLeave: hideTooltip,
                className: "text-teal-400 hover:text-teal-300 cursor-pointer font-medium transition-colors duration-200 underline decoration-teal-400/50 hover:decoration-teal-300/70",
                children: matchText
            }, `lore-${index}`, false, {
                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                lineNumber: 277,
                columnNumber: 9
            }, this));
            lastIndex = match.end;
        });
        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: parts
        }, void 0, false);
    };
    // Render content segments with styling
    const renderContentSegments = (segments)=>{
        return segments.map((segment, index)=>{
            switch(segment.type){
                case "dialogue":
                    const speakerColor = segment.speaker ? getCharacterColor(segment.speaker) : "text-blue-400";
                    const borderColor = speakerColor.replace("text-", "border-").replace("-400", "-400/30");
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3",
                        children: [
                            segment.speaker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `font-bold ${speakerColor} mb-1`,
                                children: [
                                    segment.speaker,
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 319,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `text-gray-200 font-serif pl-4 border-l-2 ${borderColor}`,
                                children: [
                                    "“",
                                    highlightLoreItems(segment.content),
                                    "”"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 323,
                                columnNumber: 15
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 317,
                        columnNumber: 13
                    }, this);
                case "monologue":
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 italic text-purple-300 font-serif",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "opacity-60",
                                children: "*"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 334,
                                columnNumber: 15
                            }, this),
                            highlightLoreItems(segment.content),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "opacity-60",
                                children: "*"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 336,
                                columnNumber: 15
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 333,
                        columnNumber: 13
                    }, this);
                case "action":
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 font-bold text-orange-400",
                        children: highlightLoreItems(segment.content)
                    }, index, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 342,
                        columnNumber: 13
                    }, this);
                case "system":
                    const systemIcon = segment.content.includes("✨") ? "✨" : segment.content.includes("📊") ? "📊" : segment.content.includes("🎯") ? "🎯" : "⚙️";
                    const systemColor = segment.content.includes("✨") ? "text-yellow-400" : segment.content.includes("📊") ? "text-blue-400" : segment.content.includes("🎯") ? "text-green-400" : "text-gray-400";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mb-2 p-3 rounded-lg bg-gray-800/50 border-l-4 ${segment.content.includes("✨") ? "border-yellow-400" : segment.content.includes("📊") ? "border-blue-400" : segment.content.includes("🎯") ? "border-green-400" : "border-gray-400"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `${systemColor} font-medium`,
                            children: [
                                systemIcon,
                                " ",
                                highlightLoreItems(segment.content)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                            lineNumber: 376,
                            columnNumber: 15
                        }, this)
                    }, index, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 364,
                        columnNumber: 13
                    }, this);
                case "item":
                    const rarityColors = {
                        common: "text-gray-400 border-gray-500",
                        good: "text-green-400 border-green-500",
                        rare: "text-blue-400 border-blue-500",
                        epic: "text-purple-400 border-purple-500",
                        legendary: "text-yellow-400 border-yellow-500"
                    };
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `inline-block px-2 py-1 rounded border ${rarityColors[segment.itemRarity || "common"]} bg-gray-800/30 font-medium cursor-help`,
                            onMouseEnter: (e)=>showTooltip(`Vật phẩm ${segment.itemRarity || "phổ thông"}`, e),
                            onMouseLeave: hideTooltip,
                            children: highlightLoreItems(segment.content)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                            lineNumber: 393,
                            columnNumber: 15
                        }, this)
                    }, index, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 392,
                        columnNumber: 13
                    }, this);
                case "description":
                default:
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 text-gray-200 font-serif leading-relaxed",
                        children: highlightLoreItems(segment.content)
                    }, index, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 413,
                        columnNumber: 13
                    }, this);
            }
        });
    };
    const getItemStyle = (type)=>{
        switch(type){
            case "story":
                return "bg-gray-900/80 border-gray-600/50 backdrop-blur-sm";
            case "user_choice":
                return "bg-blue-900/30 border-blue-400/40 backdrop-blur-sm";
            case "user_custom_action":
                return "bg-purple-900/30 border-purple-400/40 backdrop-blur-sm";
            case "system":
                return "bg-yellow-900/20 border-yellow-400/30 backdrop-blur-sm";
            default:
                return "bg-gray-900/80 border-gray-600/50 backdrop-blur-sm";
        }
    };
    const getItemIcon = (type)=>{
        switch(type){
            case "story":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 449,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                    lineNumber: 443,
                    columnNumber: 11
                }, this);
            case "user_choice":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 465,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                    lineNumber: 459,
                    columnNumber: 11
                }, this);
            case "user_custom_action":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M13 10V3L4 14h7v7l9-11h-7z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 481,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                    lineNumber: 475,
                    columnNumber: 11
                }, this);
            case "system":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 497,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                    lineNumber: 491,
                    columnNumber: 11
                }, this);
            default:
                return null;
        }
    };
    const formatTimestamp = (timestamp)=>{
        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            tooltip.visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-600 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full",
                style: {
                    left: tooltip.x,
                    top: tooltip.y
                },
                children: [
                    tooltip.content,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 530,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                lineNumber: 522,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg border border-purple-500/20 h-full flex flex-col shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-b border-purple-500/30 bg-gradient-to-r from-gray-800 to-gray-900",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-amber-400 flex items-center font-serif",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-6 h-6 mr-3 text-amber-500",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 544,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 538,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent",
                                    children: "Mặc Ảnh Thư Hương"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 551,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-gray-400 ml-2 font-normal",
                                    children: "• Lịch Sử Câu Chuyện"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 554,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                            lineNumber: 537,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 536,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: scrollRef,
                        className: "flex-1 overflow-y-auto p-6 space-y-6 max-h-96 bg-gradient-to-b from-gray-800/50 to-gray-900/50",
                        style: {
                            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `
                        },
                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center text-amber-400 py-12",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 border-4 border-amber-400/20 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 575,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-0 left-0 w-16 h-16 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 576,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 574,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex space-x-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 579,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-amber-400 rounded-full animate-bounce",
                                                style: {
                                                    animationDelay: "0.1s"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 580,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-amber-400 rounded-full animate-bounce",
                                                style: {
                                                    animationDelay: "0.2s"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 584,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 578,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-lg font-serif text-amber-300",
                                        children: "Mực đang thấm vào giấy..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 589,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-400",
                                        children: "Đang tải câu chuyện của bạn"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 592,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 573,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                            lineNumber: 572,
                            columnNumber: 13
                        }, this) : !storyHistory || storyHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center text-gray-400 py-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-20 h-20 mx-auto opacity-30",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 1.5,
                                                d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 606,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                            lineNumber: 600,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-full animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 614,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                            lineNumber: 613,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 599,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-lg font-serif text-gray-300 mb-2",
                                    children: "Trang giấy còn trắng..."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 617,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-500",
                                    children: "Câu chuyện của bạn sẽ được viết nên từ đây"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                    lineNumber: 620,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                            lineNumber: 598,
                            columnNumber: 13
                        }, this) : storyHistory.map((item, index)=>{
                            // Handle both old format (StorySegment) and new format (StoryHistoryItem)
                            const isOldFormat = "text" in item && item.text && !("content" in item);
                            const content = isOldFormat ? item.text : item.content;
                            const type = isOldFormat ? "story" : item.type;
                            const timestamp = item.timestamp;
                            // Detect content segments for advanced styling
                            const contentSegments = detectContentType(content);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative p-5 rounded-xl border ${getItemStyle(type)} shadow-lg hover:shadow-xl transition-all duration-300 group`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 648,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 649,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 650,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 651,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4 pb-2 border-b border-gray-600/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-lg bg-gray-800/50",
                                                        children: getItemIcon(type)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-gray-300 capitalize font-serif",
                                                                children: [
                                                                    type === "user_choice" && "Lựa Chọn Của Bạn",
                                                                    type === "user_custom_action" && "Hành Động Tự Do",
                                                                    type === "story" && "Câu Chuyện",
                                                                    type === "system" && "Thông Báo Hệ Thống"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                                lineNumber: 660,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-500 mt-1",
                                                                children: formatTimestamp(timestamp)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                                lineNumber: 666,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                        lineNumber: 659,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 655,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `px-2 py-1 rounded-full text-xs font-medium ${type === "story" ? "bg-gray-700/50 text-gray-300" : type === "user_choice" ? "bg-blue-900/50 text-blue-300" : type === "user_custom_action" ? "bg-purple-900/50 text-purple-300" : "bg-yellow-900/50 text-yellow-300"}`,
                                                children: [
                                                    contentSegments.length,
                                                    " đoạn"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                                lineNumber: 673,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 654,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: renderContentSegments(contentSegments)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 689,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                        lineNumber: 694,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                                lineNumber: 641,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                        lineNumber: 561,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
                lineNumber: 534,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx",
        lineNumber: 519,
        columnNumber: 5
    }, this);
};
_s(StoryHistoryPanel, "dQ9HNKAwtmmOfvlP2dRCooaZFzg=");
_c = StoryHistoryPanel;
const __TURBOPACK__default__export__ = StoryHistoryPanel;
var _c;
__turbopack_context__.k.register(_c, "StoryHistoryPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/StoryHistoryDemo.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameplayScreen$2f$StoryHistoryPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GameplayScreen/StoryHistoryPanel.tsx [app-client] (ecmascript)");
"use client";
;
;
const StoryHistoryDemo = ()=>{
    // Sample data for testing
    const sampleStoryHistory = [
        {
            type: "story",
            content: `Bạn đang đứng trước cổng của Thiên Kiếm Tông, một trong những môn phái lớn nhất trong Cửu Châu Đại Lục.

Trưởng lão Lý Thiên Minh: "Tiểu hữu, ngươi có muốn gia nhập môn phái của ta không?"

*Tôi cảm thấy một luồng khí mạnh mẽ từ ông ta phát ra, có lẽ ông ta là một cao thủ.*

Bạn nhận được Thiên Kiếm Quyết - một bí kíp kiếm thuật hiếm có.`,
            timestamp: new Date().toISOString()
        },
        {
            type: "story",
            content: `Sư phụ Trần Vô Cực: "Hôm nay ta sẽ dạy ngươi chiêu đầu tiên."

"Chiêu này gọi là Thiên Kiếm Phá Không, cần tập trung toàn bộ nội lực."

*Tôi chăm chú lắng nghe từng lời dạy của sư phụ.*`,
            timestamp: new Date().toISOString()
        },
        {
            type: "user_choice",
            content: `Tôi chọn gia nhập Thiên Kiếm Tông và học hỏi kiếm thuật từ Lý Thiên Minh.`,
            timestamp: new Date().toISOString()
        },
        {
            type: "system",
            content: `✨ [Hệ Thống]: Bạn nhận được 100 điểm kinh nghiệm!
📊 [Hệ Thống]: Kỹ năng Kiếm Thuật tăng lên cấp 2
🎯 [Mục Tiêu Mới]: Hoàn thành nhiệm vụ đầu tiên của môn phái`,
            timestamp: new Date().toISOString()
        },
        {
            type: "story",
            content: `Đồng môn Lý Hạo Nhiên: "Sư huynh, ngươi học nhanh thật đấy!"

Đồng môn Vương Tiểu Minh: "Đúng vậy, tôi học mãi mà vẫn chưa thành thạo."

Trưởng lão Lý Thiên Minh: "Các ngươi đều rất chăm chỉ, hãy tiếp tục cố gắng."

Hệ thống: "Bạn đã hoàn thành bài học đầu tiên!"`,
            timestamp: new Date().toISOString()
        }
    ];
    const sampleKnowledgeBase = [
        {
            type: "location",
            name: "Thiên Kiếm Tông",
            description: "Một môn phái kiếm thuật nổi tiếng với truyền thống lâu đời và nhiều cao thủ."
        },
        {
            type: "npc",
            name: "Lý Thiên Minh",
            description: "Trưởng lão của Thiên Kiếm Tông, tu vi sâu dày, tính cách nghiêm khắc nhưng tốt bụng."
        },
        {
            type: "npc",
            name: "Trần Vô Cực",
            description: "Sư phụ dạy kiếm thuật, nổi tiếng với chiêu thức Thiên Kiếm Phá Không."
        },
        {
            type: "location",
            name: "Cửu Châu Đại Lục",
            description: "Lục địa rộng lớn nơi các môn phái tu tiên sinh sống và tranh đấu."
        },
        {
            type: "item",
            name: "Thiên Kiếm Quyết",
            description: "Bí kíp kiếm thuật cấp cao của Thiên Kiếm Tông, chứa đựng những chiêu thức tinh diệu."
        },
        {
            type: "item",
            name: "Kiếm Thuật",
            description: "Kỹ năng sử dụng kiếm, một trong những võ công cơ bản nhất của tu tiên giả."
        },
        {
            type: "item",
            name: "Thiên Kiếm Phá Không",
            description: "Chiêu thức kiếm thuật mạnh mẽ, có thể phá vỡ không gian."
        },
        {
            type: "npc",
            name: "Lý Hạo Nhiên",
            description: "Đồng môn trong Thiên Kiếm Tông, tính cách thân thiện và hòa đồng."
        },
        {
            type: "npc",
            name: "Vương Tiểu Minh",
            description: "Đồng môn khác trong Thiên Kiếm Tông, chăm chỉ nhưng tiến bộ chậm."
        }
    ];
    const handleLoreClick = (item)=>{
        alert(`${item.name}: ${item.description}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-900 p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-white mb-8 text-center",
                    children: "Demo: Thiết Kế Mới - Lời Thoại & Tên Riêng"
                }, void 0, false, {
                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-800 rounded-lg p-6 mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-semibold text-amber-400 mb-4",
                            children: "Thay đổi thiết kế:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "text-gray-300 space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        "• ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-blue-400 font-bold",
                                            children: "Lời thoại"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                            lineNumber: 128,
                                            columnNumber: 17
                                        }, this),
                                        ": Tên người nói có màu sắc riêng biệt, in đậm, xuống dòng riêng"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        "• ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-teal-400 font-medium",
                                            children: "Tên riêng"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                            lineNumber: 132,
                                            columnNumber: 17
                                        }, this),
                                        ": NPC, vật phẩm, địa danh màu xanh ngọc, có thể click"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        "•",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-purple-400 font-medium",
                                            children: "Màu sắc nhân vật"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this),
                                        ": Mỗi nhân vật có màu riêng để dễ phân biệt"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-96",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameplayScreen$2f$StoryHistoryPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        storyHistory: sampleStoryHistory,
                        knowledgeBase: sampleKnowledgeBase,
                        onLoreClick: handleLoreClick,
                        isLoading: false
                    }, void 0, false, {
                        fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/StoryHistoryDemo.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/StoryHistoryDemo.tsx",
            lineNumber: 117,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/StoryHistoryDemo.tsx",
        lineNumber: 116,
        columnNumber: 5
    }, this);
};
_c = StoryHistoryDemo;
const __TURBOPACK__default__export__ = StoryHistoryDemo;
var _c;
__turbopack_context__.k.register(_c, "StoryHistoryDemo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_components_634f8496._.js.map