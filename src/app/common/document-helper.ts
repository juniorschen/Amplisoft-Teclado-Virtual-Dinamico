export function elementOverAnother(el1: any, el2: any) {
  if (!el1 || !el2)
    return false;
  
  const domRect1 = el1.getBoundingClientRect();
  const domRect2 = el2.getBoundingClientRect();

  return !(
    domRect1.top > domRect2.bottom ||
    domRect1.right < domRect2.left ||
    domRect1.bottom < domRect2.top ||
    domRect1.left > domRect2.right
  );
}

export function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

export const isTestEnv = window["Cypress"] != undefined;

function calculateDistance(el1: HTMLElement, el2: HTMLElement): number {
  const rect1 = el1.getBoundingClientRect();
  if(el2?.getBoundingClientRect()) { // TODO POR ALGUM MOTIVO ELE FICA VAZIO AQUI EM X CASOS QUE NÃO IMPACTAM O USO DO APP
    const rect2 = el2?.getBoundingClientRect();
    
    const center1 = {
      x: rect1.left + rect1.width / 2,
      y: rect1.top + rect1.height / 2
    };
  
    const center2 = {
      x: rect2.left + rect2.width / 2,
      y: rect2.top + rect2.height / 2
    };
  
    const distance = Math.sqrt(
      Math.pow(center1.x - center2.x, 2) +
      Math.pow(center1.y - center2.y, 2)
    );
  
    return distance;
  }

  return 1000000;
}

export function findClosestElement(mainEl: HTMLElement, elements: any[]): HTMLElement {
  let closestElement = elements[0];
  let minDistance = calculateDistance(mainEl, closestElement);

  for (let i = 1; i < elements.length; i++) {
    const currentDistance = calculateDistance(mainEl, elements[i]);
    if (currentDistance < minDistance) {
      closestElement = elements[i];
      minDistance = currentDistance;
    }
  }

  return closestElement;
}

function isLeftOf(el1: HTMLElement, el2: HTMLElement): boolean {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return rect1.right <= rect2.left;
}

function isRightOf(el1: HTMLElement, el2: HTMLElement): boolean {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return rect1.left >= rect2.right;
}

function isAbove(el1: HTMLElement, el2: HTMLElement): boolean {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return rect1.bottom <= rect2.top;
}

function isBelow(el1: HTMLElement, el2: HTMLElement): boolean {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return rect1.top >= rect2.bottom;
}

export function findElementsAround(mainEl: HTMLElement | null, elements: HTMLElement[]) {
  if (!mainEl || elements.length === 0) {
    return {
      left: [],
      right: [],
      above: [],
      below: []
    };
  }

  const elementsLeft = [];
  const elementsRight = [];
  const elementsAbove = [];
  const elementsBelow = [];

  elements.forEach(el => {
    if (isLeftOf(el, mainEl)) {
      elementsLeft.push(el);
    } else if (isRightOf(el, mainEl)) {
      elementsRight.push(el);
    } else if (isAbove(el, mainEl)) {
      elementsAbove.push(el);
    } else if (isBelow(el, mainEl)) {
      elementsBelow.push(el);
    }
  });

  return {
    left: elementsLeft,
    right: elementsRight,
    above: elementsAbove,
    below: elementsBelow
  };
}