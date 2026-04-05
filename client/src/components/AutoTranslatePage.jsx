import { useEffect, useMemo, useRef } from "react";
import translations from "../config/translations";
import { useCurrency } from "./Currencycontext";

const TEXT_ATTRS = ["placeholder", "title", "aria-label"];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function shouldSkipNode(node) {
  const parentTag = node?.parentElement?.tagName;
  return ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parentTag);
}

export default function AutoTranslatePage() {
  const { language } = useCurrency();
  const originalTextRef = useRef(new WeakMap());
  const translationMap = useMemo(() => {
    const currentCode = language?.code || "en";
    const english = translations.en || {};
    const active = translations[currentCode] || english;
    const nextMap = new Map();

    Object.keys(english).forEach((key) => {
      const source = normalizeText(english[key]);
      const target = normalizeText(active[key]);
      if (!source || !target || source === target) return;
      nextMap.set(source, active[key]);
    });

    return nextMap;
  }, [language?.code]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root || translationMap.size === 0) return undefined;

    const applyToTextNode = (node) => {
      if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipNode(node)) return;

      const original = originalTextRef.current.get(node) ?? node.textContent;
      if (!originalTextRef.current.has(node)) {
        originalTextRef.current.set(node, original);
      }

      const normalized = normalizeText(original);
      const translated = translationMap.get(normalized);
      if (translated && node.textContent !== translated) {
        node.textContent = translated;
      }
    };

    const applyToAttributes = (element) => {
      if (!(element instanceof HTMLElement)) return;

      TEXT_ATTRS.forEach((attr) => {
        if (!element.hasAttribute(attr)) return;

        const originalAttrName = `data-lx-original-${attr}`;
        const original = element.getAttribute(originalAttrName) ?? element.getAttribute(attr);
        if (!element.hasAttribute(originalAttrName) && original != null) {
          element.setAttribute(originalAttrName, original);
        }

        const translated = translationMap.get(normalizeText(original));
        if (translated && element.getAttribute(attr) !== translated) {
          element.setAttribute(attr, translated);
        }
      });
    };

    const applyTranslations = (startNode) => {
      if (!startNode) return;

      if (startNode.nodeType === Node.TEXT_NODE) {
        applyToTextNode(startNode);
        return;
      }

      if (!(startNode instanceof Element)) return;

      applyToAttributes(startNode);
      const walker = document.createTreeWalker(startNode, NodeFilter.SHOW_ALL);
      let current = walker.currentNode;

      while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
          applyToTextNode(current);
        } else if (current instanceof HTMLElement) {
          applyToAttributes(current);
        }
        current = walker.nextNode();
      }
    };

    const frameId = window.requestAnimationFrame(() => applyTranslations(root));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          applyToTextNode(mutation.target);
          return;
        }

        if (mutation.type === "attributes") {
          applyToAttributes(mutation.target);
          return;
        }

        mutation.addedNodes.forEach((node) => applyTranslations(node));
      });
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TEXT_ATTRS,
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [translationMap]);

  return null;
}
