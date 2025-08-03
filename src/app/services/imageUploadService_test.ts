// Test simple para verificar exports

console.log('🔍 INICIANDO TEST DE SERVICIO...');

class TestImageUploadService {
  constructor() {
    console.log('🔧 TestImageUploadService constructor ejecutado');
  }

  async uploadMultipleImages(files: File[], productId: number): Promise<string[]> {
    console.log(`TEST: Subiendo ${files.length} imágenes para producto ${productId}`);
    return ['/images/test1.jpg', '/images/test2.jpg'];
  }

  async uploadImage(file: File, productId: number): Promise<string> {
    console.log(`TEST: Subiendo imagen ${file.name} para producto ${productId}`);
    return '/images/test.jpg';
  }

  validateImageFile(file: File): { isValid: boolean; error?: string } {
    return { isValid: true };
  }
}

console.log('🔧 Creando instancia de TEST...');
const testService = new TestImageUploadService();
console.log('🔧 TEST - Instancia creada:', !!testService);
console.log('🔧 TEST - uploadMultipleImages type:', typeof testService.uploadMultipleImages);

export const imageUploadService = testService;
export default testService;
export { TestImageUploadService };

console.log('✅ TEST - Export completado');
