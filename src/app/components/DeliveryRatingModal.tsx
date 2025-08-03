'use client';

import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface DeliveryRatingModalProps {
  show: boolean;
  onHide: () => void;
  orderId: string;
  deliveryPersonName: string;
  onRatingSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function DeliveryRatingModal({ 
  show, 
  onHide, 
  orderId, 
  deliveryPersonName,
  onRatingSubmit 
}: DeliveryRatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onRatingSubmit(rating, comment.trim());
      // Reset form
      setRating(0);
      setComment('');
      onHide();
    } catch (error) {
      setError('Error al enviar la calificación. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-star-fill me-2"></i>
          Califica tu entrega
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="mb-3">
            <i className="bi bi-truck text-primary" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5>¿Cómo fue tu experiencia con {deliveryPersonName}?</h5>
          <p className="text-muted">Tu opinión nos ayuda a mejorar el servicio</p>
        </div>

        {/* Sistema de estrellas */}
        <div className="text-center mb-4">
          <div className="mb-2">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <i
                key={starValue}
                className={`bi ${
                  starValue <= displayRating ? 'bi-star-fill' : 'bi-star'
                } text-warning me-1`}
                style={{ 
                  fontSize: '2rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => handleStarHover(starValue)}
                onMouseLeave={handleStarLeave}
              ></i>
            ))}
          </div>
          <div className="text-center">
            <strong className={`${displayRating > 0 ? 'text-primary' : 'text-muted'}`}>
              {getRatingText(displayRating)}
            </strong>
            {displayRating > 0 && (
              <div className="small text-muted">
                {displayRating} de 5 estrellas
              </div>
            )}
          </div>
        </div>

        {/* Comentario opcional */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">
            <i className="bi bi-chat-text me-1"></i>
            Comentario (opcional)
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Cuéntanos más detalles sobre tu experiencia..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            disabled={isSubmitting}
          />
          <Form.Text className="text-muted">
            {comment.length}/500 caracteres
          </Form.Text>
        </Form.Group>

        {/* Error */}
        {error && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Información adicional */}
        <div className="bg-light p-3 rounded">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            <strong>Pedido:</strong> #{orderId.substring(0, 8)}...<br />
            <strong>Repartidor:</strong> {deliveryPersonName}
          </small>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-1"></i>
              Enviar calificación
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
