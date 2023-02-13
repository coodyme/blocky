export function toggleElement(elementId) {
  if (typeof elementId !== "string") {
    throw new Error("elementId must be a string");
  }
  
  let x = document.getElementById(elementId);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}