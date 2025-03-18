"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./globals.css");
const google_1 = require("next/font/google");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsxs)("html", { lang: "en", children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("title", { children: "Multilayer Chess" }), (0, jsx_runtime_1.jsx)("meta", { name: "description", content: "Experience chess in multiple dimensions" })] }), (0, jsx_runtime_1.jsx)("body", { className: inter.className, children: children })] }));
}
//# sourceMappingURL=layout.js.map