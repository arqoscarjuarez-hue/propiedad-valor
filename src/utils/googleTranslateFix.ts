// Solución para el problema de Google Translate que causa errores removeChild
// Basado en la solución oficial del equipo de React: https://github.com/facebook/react/issues/11538

let isPatched = false;

export const initGoogleTranslateFix = () => {
  if (isPatched || typeof document === 'undefined') return;
  
  // Guardar los métodos originales
  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  // Monkey patch para removeChild
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    try {
      // Verificar si el nodo es realmente hijo antes de intentar removerlo
      if (child.parentNode !== this) {
        console.warn('Google Translate interference detected: removeChild called on non-child node');
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    } catch (e) {
      console.warn('Google Translate interference prevented removeChild error:', e);
      return child;
    }
  };

  // Monkey patch para insertBefore
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    try {
      // Verificar si el nodo de referencia es realmente hijo
      if (referenceNode && referenceNode.parentNode !== this) {
        console.warn('Google Translate interference detected: insertBefore called with invalid reference node');
        return this.appendChild(newNode) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (e) {
      console.warn('Google Translate interference prevented insertBefore error:', e);
      try {
        return this.appendChild(newNode) as T;
      } catch (appendError) {
        console.warn('Fallback appendChild also failed:', appendError);
        return newNode;
      }
    }
  };

  isPatched = true;
  console.log('Google Translate compatibility fix applied');
};