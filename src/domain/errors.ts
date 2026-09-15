export class InvalidUrlError extends Error {
  constructor() {
    super('No encontramos un enlace válido');
    this.name = 'InvalidUrlError';
  }
}

export class InvalidSharedContentError extends Error {
  constructor() {
    super('El contenido compartido no contiene un enlace válido');
    this.name = 'InvalidSharedContentError';
  }
}

export class ProtectedCollectionError extends Error {
  constructor() {
    super('La colección Unsorted no se puede eliminar');
    this.name = 'ProtectedCollectionError';
  }
}

