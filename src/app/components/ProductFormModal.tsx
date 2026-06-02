import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Form, Button, Row, Col, Badge, Alert, Spinner, Image } from 'react-bootstrap';
import { inventoryService, type ProductInventory } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import CATEGORIES, { SUBCATEGORIES, getSubcategoryIdRange } from '../constants/categories'; // Categorías y subcategorías con rangos de ID

// Función para cargar el servicio de imágenes de forma segura
const getImageUploadService = async () => {
  try {
    console.log('🔄 Intentando cargar servicio simplificado de Firebase Storage...');
    
    const module = await import('../services/imageUploadService_simple');
    console.log('📦 Módulo simplificado cargado:', !!module);
    console.log('📦 Default export:', !!module.default);
    console.log('📦 Named export:', !!module.imageUploadService);
    
    const service = module.default || module.imageUploadService;
    console.log('� Servicio extraído:', !!service);
    console.log('� uploadMultipleImages method:', typeof service?.uploadMultipleImages);
    
    if (service && typeof service.uploadMultipleImages === 'function') {
      console.log('✅ Servicio de Firebase Storage cargado correctamente');
      return service;
    } else {
      console.warn('⚠️ Servicio no tiene el método uploadMultipleImages');
      return null;
    }
  } catch (error) {
    console.error('❌ Error cargando servicio de Firebase Storage:', error);
    return null;
  }
};

// Servicio de respaldo para cuando Firebase no esté disponible
const createFallbackImageService = () => {
  
  // Función auxiliar para comprimir imágenes
  const compressImageToDataUrl = async (file: File, maxWidth: number = 400, maxHeight: number = 300, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img') as HTMLImageElement;

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                console.log(`✅ Compresión respaldo: ${file.name} - ${(result.length / 1024).toFixed(1)}KB`);
                resolve(result);
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Error comprimiendo imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  return {
    uploadMultipleImages: async (files: File[], productId: number): Promise<string[]> => {
      console.log('🔄 Servicio de respaldo - comprimiendo archivos reales...');
      
      // Validar tamaño total
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log(`📊 Tamaño total: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
      
      if (totalSize > 3 * 1024 * 1024) {
        throw new Error(`El tamaño total de las imágenes (${(totalSize / (1024 * 1024)).toFixed(2)}MB) excede el límite de 3MB.`);
      }
      
      // Configuración de compresión adaptativa
      const maxWidth = files.length > 1 ? 300 : 400;
      const maxHeight = files.length > 1 ? 225 : 300;
      const quality = files.length > 1 ? 0.5 : 0.7;
      
      const dataUrls = await Promise.all(files.map((file, index) => 
        compressImageToDataUrl(file, maxWidth, maxHeight, quality)
      ));
      
      // Validar tamaño final
      const totalDataSize = dataUrls.reduce((sum, dataUrl) => sum + dataUrl.length, 0);
      console.log(`📊 Tamaño final Data URLs: ${(totalDataSize / 1024).toFixed(1)}KB`);
      
      if (totalDataSize > 800 * 1024) { // 800KB límite para Firestore
        console.warn('⚠️ Aplicando compresión ultra para Firestore...');
        const ultraCompressed = await Promise.all(files.map((file) => 
          compressImageToDataUrl(file, 250, 188, 0.4)
        ));
        console.log('✅ Ultra-compresión completada');
        return ultraCompressed;
      }
      
      console.log('✅ Servicio de respaldo completado con imágenes comprimidas');
      return dataUrls;
    },
    
    deleteImage: async (imageUrl: string): Promise<void> => {
      console.log('🗑️ Servicio de respaldo - simulando eliminación de:', imageUrl);
    }
  };
};

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  product?: ProductInventory | null;
  onProductSaved: () => void;
  existingProductIds?: number[];
}

export default function ProductFormModal({ show, onHide, product, onProductSaved }: ProductFormModalProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    productId: 0,
    name: '',
    price: 0,
    stock: 0,
    category: '',
    subcategory: '',
    description: '',
    details: [] as string[],
    featured: false
  });

  const [images, setImages] = useState<string[]>([]);
  const [newDetail, setNewDetail] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoIdInfo, setAutoIdInfo] = useState<string>('');
  const [autoIdLoading, setAutoIdLoading] = useState<boolean>(false);
  const [originalProductId, setOriginalProductId] = useState<number | null>(null);

  const isEditing = !!product;

  // Effect para actualizar los datos cuando cambia el producto
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        subcategory: product.subcategory || '',
        description: product.description || '',
        details: product.details || [],
        featured: product.featured ?? false
      });
      setImages(product.images || []);
      setOriginalProductId(product.productId);
    } else {
      // Reset para nuevo producto
      setFormData({
        productId: 0,
        name: '',
        price: 0,
        stock: 0,
        category: '',
        subcategory: '',
        description: '',
        details: [],
        featured: false
      });
      setImages([]);
      setOriginalProductId(null);
    }
    // Limpiar estados de archivos y errores
    setSelectedFiles([]);
    setError('');
    setUploadProgress(0);
    setAutoIdInfo('');
    setAutoIdLoading(false);
  }, [product]);

  // 🔄 Cuando se elige categoría o subcategoría en modo creación, calcular ID automático
  useEffect(() => {
    if (isEditing) return; // no tocar IDs en edición
    if (!formData.category || !formData.subcategory) {
      setAutoIdInfo('');
      return;
    }

    const range = getSubcategoryIdRange(formData.subcategory);
    if (!range) {
      setAutoIdInfo('Esta subcategoría aún no tiene rango de IDs definido. Ingresa el ID manualmente.');
      return;
    }

    let cancelled = false;
    const loadNextId = async () => {
      try {
        setAutoIdLoading(true);
        const nextId = await inventoryService.getNextProductIdInRange(range.minId, range.maxId);
        if (cancelled) return;
        setFormData(prev => ({
          ...prev,
          productId: nextId,
        }));
        setAutoIdInfo(`ID sugerido automáticamente para "${formData.subcategory}": ${nextId} (rango ${range.minId}-${range.maxId})`);
      } catch (err: any) {
        if (cancelled) return;
        setAutoIdInfo(err?.message || `No se pudo calcular un ID disponible en el rango ${range.minId}-${range.maxId}`);
      } finally {
        if (!cancelled) setAutoIdLoading(false);
      }
    };

    loadNextId();

    return () => {
      cancelled = true;
    };
  }, [formData.category, formData.subcategory, isEditing]);

  // Función optimizada de validación de archivos
  const validateImageFile = useMemo(() => (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP'
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido'
      };
    }

    if (!file.name || file.name.length < 1) {
      return {
        isValid: false,
        error: 'Nombre de archivo inválido'
      };
    }

    return { isValid: true };
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addDetail = useCallback(() => {
    if (newDetail.trim()) {
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, newDetail.trim()]
      }));
      setNewDetail('');
    }
  }, [newDetail]);

  const removeDetail = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles: File[] = [];
    let totalSize = 0;
    
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
        totalSize += file.size;
      } else {
        setError(validation.error || 'Archivo inválido');
        return;
      }
    }
    
    // Validar tamaño total (3MB máximo)
    const maxTotalSize = 3 * 1024 * 1024; // 3MB
    if (totalSize > maxTotalSize) {
      setError(`El tamaño total de las imágenes (${(totalSize / (1024 * 1024)).toFixed(2)}MB) excede el límite de 3MB. Por favor selecciona imágenes más pequeñas o menos cantidad.`);
      return;
    }
    
    console.log(`📊 Archivos seleccionados: ${validFiles.length} imágenes, ${(totalSize / (1024 * 1024)).toFixed(2)}MB total`);
    setSelectedFiles(validFiles);
    setError('');
  }, [validateImageFile]);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    
    if (isEditing) {
      try {
        const imageService = await getImageUploadService();
        if (imageService && typeof imageService.deleteImage === 'function') {
          await imageService.deleteImage(imageUrl);
          console.log('✅ Imagen eliminada del storage:', imageUrl);
        } else {
          console.log('⚠️ Servicio de Firebase no disponible, imagen eliminada solo del estado local');
        }
      } catch (error) {
        console.error('❌ Error eliminando imagen del storage:', error);
        console.log('✅ Imagen eliminada del estado local exitosamente');
      }
    }
  }, [images, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Debes estar autenticado para crear/editar productos');
      }

      if (!formData.name.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      
      if (formData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      
      if (formData.stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      if (!formData.category.trim()) {
        throw new Error('Debes seleccionar una categoría para el producto');
      }

      if (!formData.subcategory.trim()) {
        throw new Error('Debes seleccionar una subcategoría para asignar correctamente el ID');
      }

      // Validar que el ID esté dentro del rango de la subcategoría (si existe rango configurado)
      const range = getSubcategoryIdRange(formData.subcategory);
      if (range) {
        if (formData.productId < range.minId || formData.productId > range.maxId) {
          throw new Error(`El ID del producto debe estar entre ${range.minId} y ${range.maxId} para la subcategoría seleccionada.`);
        }
      }

      let finalImages = [...images];
      
      // Subir las nuevas imágenes seleccionadas
      if (selectedFiles.length > 0) {
        setUploadProgress(10);
        try {
          console.log('📤 Intentando subir', selectedFiles.length, 'imagen(es) real(es) a Firebase Storage...');
          
          // Intentar cargar el servicio real de Firebase
          const imageService = await getImageUploadService();
          
          if (imageService && typeof imageService.uploadMultipleImages === 'function') {
            console.log('✅ Servicio de Firebase disponible, subiendo archivos reales...');
            console.log('📋 Detalles de archivos a subir:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
            
            const uploadedUrls = await imageService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('🎉 Imágenes subidas exitosamente a Firebase:', uploadedUrls);
            finalImages = [...finalImages, ...uploadedUrls];
          } else {
            console.warn('⚠️ Servicio de Firebase no disponible, usando servicio de respaldo...');
            console.log('📋 Razón: imageService =', imageService, ', método uploadMultipleImages =', imageService?.uploadMultipleImages);
            const fallbackService = createFallbackImageService();
            const fallbackUrls = await fallbackService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('✅ Servicio de respaldo completado:', fallbackUrls);
            finalImages = [...finalImages, ...fallbackUrls];
          }
          
          setUploadProgress(90);
        } catch (uploadError: any) {
          console.error('❌ Error subiendo imágenes:', uploadError);
          
          // Si hay error, usar el servicio de respaldo
          console.log('🔄 Usando servicio de respaldo debido al error...');
          try {
            const fallbackService = createFallbackImageService();
            const fallbackUrls = await fallbackService.uploadMultipleImages(
              selectedFiles, 
              formData.productId
            );
            console.log('✅ Servicio de respaldo completado tras error:', fallbackUrls);
            finalImages = [...finalImages, ...fallbackUrls];
          } catch (fallbackError) {
            console.error('❌ Error en servicio de respaldo:', fallbackError);
            throw new Error(`❌ Error subiendo imágenes: ${uploadError.message}`);
          }
        }
      }

      // Si no hay imágenes, usar una imagen placeholder como fallback
      if (finalImages.length === 0) {
        console.warn('⚠️ Producto sin imágenes, usando imagen placeholder');
        finalImages = ['/images/product1.svg'];
      }

      const productData: Omit<ProductInventory, 'lastUpdated' | 'isActive'> = {
        productId: formData.productId,
        name: formData.name.trim(),
        price: formData.price,
        stock: formData.stock,
        images: finalImages,
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim(),
        description: formData.description.trim(),
        details: formData.details,
        featured: formData.featured
      };

      let success: boolean;

      // Si estamos editando y tenemos un ID original, usar la lógica que permite cambio de ID sin duplicar
      if (isEditing && originalProductId !== null) {
        success = await inventoryService.updateProductWithIdChange(originalProductId, productData);
      } else {
        success = await inventoryService.createOrUpdateProduct(productData);
      }
      
      if (success) {
        setUploadProgress(100);
        console.log('✅ Producto guardado exitosamente con imágenes reales');
        onProductSaved();
        handleClose();
      } else {
        throw new Error('Error al guardar el producto en el inventario');
      }

    } catch (error: any) {
      console.error('❌ Error completo:', error);
      setError(error.message || 'Error al procesar el formulario');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: 0,
      name: '',
      price: 0,
      stock: 0,
      category: '',
      subcategory: '',
      description: '',
      details: [],
      featured: false
    });
    setImages([]);
    setSelectedFiles([]);
    setNewDetail('');
    setError('');
    setUploadProgress(0);
    setAutoIdInfo('');
    setAutoIdLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-box me-2"></i>
          {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {uploadProgress > 0 && (
            <Alert variant="info">
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando imágenes desde tu computadora... {uploadProgress}%
                <br />
                <small className="text-muted">
                  Intentando Firebase Storage, con respaldo automático si es necesario
                </small>
              </div>
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>ID del Producto *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.productId || ''}
                  onChange={(e) => handleInputChange('productId', parseInt(e.target.value) || 0)}
                  disabled={!isEditing} // en creación se calcula automáticamente
                  required
                />
                {!isEditing && autoIdInfo && (
                  <Form.Text className="text-muted d-block mt-1">
                    {autoIdLoading && <Spinner animation="border" size="sm" className="me-2" />} 
                    {autoIdInfo}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="featured-product-check"
              label="Destacar este producto en la página principal"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
            />
            <Form.Text className="text-muted">
              Si activas esta opción, el producto aparecerá en la sección de productos destacados de la portada.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stock *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    // al cambiar categoría, limpiar subcategoría e ID
                    setFormData(prev => ({
                      ...prev,
                      category: value,
                      subcategory: '',
                      productId: isEditing ? prev.productId : 0,
                    }));
                    setAutoIdInfo('');
                  }}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Esta categoría determinará en qué sección aparecerá el producto en la tienda
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Subcategoría, dependiente de la categoría seleccionada */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subcategoría *</Form.Label>
                <Form.Select
                  value={formData.subcategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      subcategory: value,
                    }));
                  }}
                  disabled={!formData.category}
                  required
                >
                  <option value="">Selecciona una subcategoría</option>
                  {SUBCATEGORIES.filter((s) => s.id === formData.category).map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Define el rango de IDs y ayuda a organizar el inventario.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Form.Group>

          {/* Detalles */}
          <Form.Group className="mb-3">
            <Form.Label>Detalles del Producto</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ej: Hipoalergénico, Vitamina E, Libre de parabenos"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
              />
              <Button variant="outline-primary" className="ms-2" onClick={addDetail}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
            <div className="d-flex flex-column gap-1">
              {formData.details.map((detail: string, index: number) => (
                <div key={index} className="d-flex align-items-center">
                  <span className="flex-grow-1">• {detail}</span>
                  <i 
                    className="bi bi-x text-danger" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeDetail(index)}
                  ></i>
                </div>
              ))}
            </div>
          </Form.Group>

          {/* Imágenes existentes */}
          {images.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Imágenes Actuales</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="position-relative">
                    <Image
                      src={image}
                      alt={`Producto ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      className="rounded border"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      style={{ transform: 'translate(50%, -50%)' }}
                      onClick={() => removeExistingImage(index)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>
          )}

          {/* Nuevas imágenes */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-camera me-2"></i>
              {images.length > 0 ? 'Agregar Más Imágenes desde tu Computadora' : 'Subir Imágenes desde tu Computadora'}
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
            />
            <Form.Text className="text-muted">
              <strong>📸 Selecciona imágenes directamente desde tu computadora</strong>
              <br />
              Formatos permitidos: JPG, PNG, WebP. Máximo 5MB por imagen, 3MB total.
              <br />
              <small className="text-info">
                ✨ Sistema inteligente: Las imágenes se comprimen automáticamente para optimizar el almacenamiento.
                Intentará subir a Firebase Storage, con sistema de respaldo automático si hay problemas.
              </small>
            </Form.Text>
            
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <div className="fw-bold mb-2">📁 Archivos seleccionados desde tu computadora:</div>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-2 border rounded mb-1">
                    <div>
                      <strong>{file.name}</strong>
                      <br />
                      <small className="text-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {selectedFiles.length > 0 ? 'Subiendo imágenes reales...' : (isEditing ? 'Actualizando...' : 'Creando...')}
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
