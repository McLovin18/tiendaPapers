console.log('Testing image service import...');

async function testImport() {
  try {
    // Test 1: Dynamic import
    console.log('=== Test 1: Dynamic Import ===');
    const dynamicModule = await import('./src/app/services/imageUploadService.ts');
    console.log('Dynamic import result:', dynamicModule);
    console.log('Keys:', Object.keys(dynamicModule));
    console.log('imageUploadService:', dynamicModule.imageUploadService);
    console.log('default:', dynamicModule.default);
    
    // Test 2: Check what's actually in default
    if (dynamicModule.default) {
      console.log('Default type:', typeof dynamicModule.default);
      console.log('Default constructor:', dynamicModule.default.constructor?.name);
      console.log('Default methods:', Object.getOwnPropertyNames(dynamicModule.default));
      console.log('Default prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(dynamicModule.default)));
    }
    
  } catch (error) {
    console.error('Import test failed:', error);
  }
}

testImport();
