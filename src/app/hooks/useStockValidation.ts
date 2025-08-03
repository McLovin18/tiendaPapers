import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';

interface UseStockValidationProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface StockInfo {
  productId: number;
  name: string;
  available: number;
  requested: number;
  isValid: boolean;
}

export const useStockValidation = ({ items }: UseStockValidationProps) => {
  const [stockInfo, setStockInfo] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const validateStock = useCallback(async () => {
    if (loading || items.length === 0) return;

    try {
      setLoading(true);
      const stockChecks: StockInfo[] = [];
      const stockErrors: string[] = [];

      for (const item of items) {
        try {
          const productId = parseInt(item.id);
          const availableStock = await inventoryService.getProductStock(productId);
          const isItemValid = availableStock >= item.quantity;

          if (!isItemValid) {
            stockErrors.push(`${item.name}: Stock insuficiente (Disponible: ${availableStock}, Solicitado: ${item.quantity})`);
          }

          stockChecks.push({
            productId,
            name: item.name,
            available: availableStock,
            requested: item.quantity,
            isValid: isItemValid
          });
        } catch (error) {
          stockErrors.push(`${item.name}: Error verificando stock`);
          stockChecks.push({
            productId: parseInt(item.id),
            name: item.name,
            available: 0,
            requested: item.quantity,
            isValid: false
          });
        }
      }

      setStockInfo(stockChecks);
      setLastCheck(new Date());
      setErrors(stockErrors);
      
      const isAllValid = stockChecks.every(info => info.isValid);
      setIsValid(isAllValid);
      
    } catch (error) {
      console.error('Error validating stock:', error);
      setErrors(['Error al verificar stock de los productos']);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }, [items.length, loading]);

  useEffect(() => {
    if (items.length > 0) {
      // Verificar solo una vez al cargar o cuando cambien los items
      const timeoutId = setTimeout(validateStock, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setStockInfo([]);
      setIsValid(true);
      setErrors([]);
    }
  }, [items.length]);

  return {
    stockInfo,
    loading,
    lastCheck,
    isValid,
    errors,
    validateStock
  };
};
