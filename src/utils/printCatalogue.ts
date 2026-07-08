export type PrintSize = "default" | "large";

const largePrintClass = "print-large";

export function printCatalogue(size: PrintSize) {
  document.body.classList.toggle(largePrintClass, size === "large");

  const cleanup = () => {
    document.body.classList.remove(largePrintClass);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1000);
}
