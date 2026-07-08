export type PrintSize = "default" | "large";
export type PrintLayout = "default" | "admin";

const largePrintClass = "print-large";
const adminPrintClass = "print-admin";

export function printCatalogue(size: PrintSize, layout: PrintLayout = "default") {
  const root = document.documentElement;

  document.body.classList.toggle(largePrintClass, size === "large");
  document.body.classList.toggle(adminPrintClass, layout === "admin");
  root.classList.toggle(adminPrintClass, layout === "admin");

  const cleanup = () => {
    document.body.classList.remove(largePrintClass);
    document.body.classList.remove(adminPrintClass);
    root.classList.remove(adminPrintClass);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1000);
}
