export type Orientation = "vertical" | "horizontal";
type ResizeAxis = "x" | "y";
type ResizeEdge = "start" | "end";
type Cleanup = () => void;

let isVertical: boolean = true;
let isVisible: boolean = false;
let resizeHandlerX: any = null;
let resizeHandlerY: any = null;
let elevationProfileResizeHandlerContainer: HTMLDivElement;
let elevationProfileResizeHandler: HTMLDivElement;
let elevationProfileContainer: HTMLDivElement;

export const resizeOffsetPercentage: number = 10;
export const profileViewInitialOrientation: Orientation = "vertical";
export let profileViewInitialSize: number = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function registerProfileResizeHandler(
  handler: HTMLDivElement | null,
  container: HTMLDivElement | null
) {
  if (handler) elevationProfileResizeHandler = handler;
  if (container) elevationProfileContainer = container;

  if (isVertical) {
    if (resizeHandlerX != null) resizeHandlerX();

    resizeHandlerY = profileResizeHandler(
      elevationProfileResizeHandler,
      elevationProfileContainer,
      "y",
      "start"
    );
  } else {
    if (resizeHandlerY != null) resizeHandlerY();

    resizeHandlerX = profileResizeHandler(
      elevationProfileResizeHandler,
      elevationProfileContainer,
      "x",
      "end"
    );
  }
}

function profileResizeHandler(
  handler: HTMLDivElement,
  container: HTMLDivElement,
  axis: ResizeAxis,
  edge: ResizeEdge
): Cleanup {
  let startX = 0;
  let startY = 0;
  let startSize = 0;

  const MIN_SIZE = 200;

  const direction = edge === "end" ? 1 : -1;

  const onPointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;

    startSize = axis === "x" ? container.offsetWidth : container.offsetHeight;

    handler.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!handler.hasPointerCapture(e.pointerId)) return;

    const delta = axis === "x" ? e.clientX - startX : e.clientY - startY;

    const parent = container.parentElement;
    if (!parent) return;

    const maxSize = axis === "x" ? parent.clientWidth : parent.clientHeight;

    const newSize = Math.max(
      MIN_SIZE,
      Math.min(startSize + delta * direction, maxSize)
    );

    if (axis === "x") {
      container.style.width = `${newSize}px`;
    } else {
      container.style.height = `${newSize}px`;
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (handler.hasPointerCapture(e.pointerId)) {
      handler.releasePointerCapture(e.pointerId);
    }
  };

  handler.addEventListener("pointerdown", onPointerDown);
  handler.addEventListener("pointermove", onPointerMove);
  handler.addEventListener("pointerup", onPointerUp);

  return () => {
    handler.removeEventListener("pointerdown", onPointerDown);
    handler.removeEventListener("pointermove", onPointerMove);
    handler.removeEventListener("pointerup", onPointerUp);
  };
}

export function elevationProfileResizer(clientX: number, clientY: number) {
  if (isVertical) {
    // For vertical, anchored to bottom
    const newPercent = Math.max(
      resizeOffsetPercentage,
      Math.min(
        100 - resizeOffsetPercentage,
        ((window.innerHeight - clientY) / window.innerHeight) * 100
      )
    );
    profileViewInitialSize = newPercent;
  } else {
    // For horizontal, anchored to left
    const newPercent = Math.max(
      resizeOffsetPercentage,
      Math.min(
        100 - resizeOffsetPercentage,
        (clientX / window.innerWidth) * 100
      )
    );
    profileViewInitialSize = newPercent;
  }
}

export function registerOnClickListener(element: any, method: any) {
  if (element) {
    element.addEventListener("click", method);
  } else {
    throw new Error(
      `registerOnClickListener initialization failed ${element} ${method}`
    );
  }
}

export function updateElevationProfileOrientationIcon(
  button: HTMLButtonElement
) {
  const BiSolidDockLeft = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2zm-11 0V5h9l.002 14H10z"></path></svg>`;

  const BiSolidDockBottom = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 5l.001 9H5V5h14z"></path></svg>`;

  if (isVertical) {
    button.innerHTML = BiSolidDockLeft;
  } else {
    button.innerHTML = BiSolidDockBottom;
  }
}

export function toggleElevationProfileVisibility(
  elevationProfileContainer: HTMLDivElement
) {
  if (elevationProfileContainer) {
    isVisible = !isVisible;
  }
  return isVisible!;
}

export function updateElevationProfileResizeHandlerStyles(container: HTMLDivElement) {
  if (isVertical) {
    container.setAttribute("aria-orientation", "vertical");
    const handler = container.querySelector("#elevationProfileResizeHandler") as HTMLDivElement | null;
    const handlerContainer = container.querySelector("#elevationProfileResizeContainer") as HTMLDivElement | null;

    handlerContainer!.classList.add("h-2", "left-0")
    handlerContainer!.classList.remove("w-3",  "bottom-0")
    handler!.classList.remove("h-30", "w-0.5", "-mr-0.5");
    handler!.classList.add("h-0.5", "w-40", "-mb-0.5");

  } else {
    container.setAttribute("aria-orientation", "horizontal");
    const handler = container.querySelector("#elevationProfileResizeHandler") as HTMLDivElement | null;
    const handlerContainer = container.querySelector("#elevationProfileResizeContainer") as HTMLDivElement | null;

    handlerContainer!.classList.remove("h-2", "left-0")
    handlerContainer!.classList.add("w-3",  "bottom-0")
    handler!.classList.remove("h-0.5", "w-40", "-mb-0.5");
    handler!.classList.add("h-30", "w-0.5", "-mr-0.5");
    
  }
}

export function toggleElevationProfileOrientation(
  elevationProfileContainer: HTMLDivElement
) {
  if (elevationProfileContainer) {
    isVertical = elevationProfileContainer.classList.toggle(
      "orientation-vertical"
    );
    elevationProfileContainer.classList.toggle("orientation-horizontal");
  }

  registerProfileResizeHandler(null, null);
  updateElevationProfileResizeHandlerStyles(elevationProfileContainer);

  return isVertical!;
}

export function getElevationProfileOrientation() {
  return isVertical === true ? "vertical" : "horizontal";
}

export function getElevationProfileVisibility() {
  return isVisible;
}

export function updateElevationProfileContainerStyles(
  elevationProfileContainer: HTMLDivElement,
  viewSize: number
) {
  const _isVertical = getElevationProfileOrientation() === "vertical";

  //   console.log("Orientation(Vertical):" + _isVertical);
  //   console.log("Visibility:" + isVisible);

  if (_isVertical) {
    elevationProfileContainer!.style.width = `100vw`;
    elevationProfileContainer!.style.height = `${viewSize}vh`;
    elevationProfileContainer!.style.transform = isVisible
      ? "translateY(0)"
      : `translateY(${viewSize}vh)`;
  } else {
    elevationProfileContainer!.style.height = `100vh`;
    elevationProfileContainer!.style.width = `${viewSize}vw`;
    elevationProfileContainer!.style.transform = isVisible
      ? "translateX(0)"
      : `translateX(-${viewSize}vw)`!;
  }
}
