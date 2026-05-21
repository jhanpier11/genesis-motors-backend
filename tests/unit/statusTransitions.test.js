describe('🧪 Pruebas Unitarias - Transiciones de Estado', () => {
  
  const validTransitions = {
    'creada': ['en_progreso', 'cancelada'],
    'en_progreso': ['completada', 'pausada', 'cancelada'],
    'pausada': ['en_progreso', 'cancelada'],
    'completada': ['entregada'],
    'entregada': [],
    'cancelada': []
  };

  const isValidTransition = (currentStatus, newStatus) => {
    if (!validTransitions[currentStatus]) return false;
    return validTransitions[currentStatus].includes(newStatus);
  };

  describe('Órdenes de Trabajo', () => {
    it('✅ creada -> en_progreso', () => {
      expect(isValidTransition('creada', 'en_progreso')).toBe(true);
    });

    it('✅ creada -> cancelada', () => {
      expect(isValidTransition('creada', 'cancelada')).toBe(true);
    });

    it('✅ en_progreso -> completada', () => {
      expect(isValidTransition('en_progreso', 'completada')).toBe(true);
    });

    it('✅ en_progreso -> pausada', () => {
      expect(isValidTransition('en_progreso', 'pausada')).toBe(true);
    });

    it('✅ pausada -> en_progreso', () => {
      expect(isValidTransition('pausada', 'en_progreso')).toBe(true);
    });

    it('✅ completada -> entregada', () => {
      expect(isValidTransition('completada', 'entregada')).toBe(true);
    });

    it('❌ creada -> completada (no permitido)', () => {
      expect(isValidTransition('creada', 'completada')).toBe(false);
    });

    it('❌ creada -> entregada (no permitido)', () => {
      expect(isValidTransition('creada', 'entregada')).toBe(false);
    });

    it('❌ entregada -> cualquier estado (no permitido)', () => {
      expect(isValidTransition('entregada', 'creada')).toBe(false);
      expect(isValidTransition('entregada', 'en_progreso')).toBe(false);
      expect(isValidTransition('entregada', 'completada')).toBe(false);
    });

    it('❌ cancelada -> cualquier estado (no permitido)', () => {
      expect(isValidTransition('cancelada', 'creada')).toBe(false);
      expect(isValidTransition('cancelada', 'en_progreso')).toBe(false);
    });

    it('❌ Estado inválido', () => {
      expect(isValidTransition('estado_inexistente', 'creada')).toBe(false);
      expect(isValidTransition('creada', 'estado_inexistente')).toBe(false);
    });
  });

  describe('Citas', () => {
    const appointmentTransitions = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['en_progreso', 'cancelada'],
      'en_progreso': ['completada'],
      'completada': [],
      'cancelada': []
    };

    const isValidAppointmentTransition = (current, newStatus) => {
      if (!appointmentTransitions[current]) return false;
      return appointmentTransitions[current].includes(newStatus);
    };

    it('✅ pendiente -> confirmada', () => {
      expect(isValidAppointmentTransition('pendiente', 'confirmada')).toBe(true);
    });

    it('✅ pendiente -> cancelada', () => {
      expect(isValidAppointmentTransition('pendiente', 'cancelada')).toBe(true);
    });

    it('✅ confirmada -> en_progreso', () => {
      expect(isValidAppointmentTransition('confirmada', 'en_progreso')).toBe(true);
    });

    it('❌ pendiente -> completada (no permitido)', () => {
      expect(isValidAppointmentTransition('pendiente', 'completada')).toBe(false);
    });

    it('❌ cancelada -> pendiente (no permitido)', () => {
      expect(isValidAppointmentTransition('cancelada', 'pendiente')).toBe(false);
    });
  });

  describe('Flujo completo feliz', () => {
    it('✅ Flujo normal de orden: creada -> en_progreso -> completada -> entregada', () => {
      let estado = 'creada';
      
      estado = 'en_progreso';
      expect(isValidTransition('creada', estado)).toBe(true);
      
      estado = 'completada';
      expect(isValidTransition('en_progreso', estado)).toBe(true);
      
      estado = 'entregada';
      expect(isValidTransition('completada', estado)).toBe(true);
    });

    it('✅ Flujo con pausa: creada -> en_progreso -> pausada -> en_progreso -> completada', () => {
      expect(isValidTransition('creada', 'en_progreso')).toBe(true);
      expect(isValidTransition('en_progreso', 'pausada')).toBe(true);
      expect(isValidTransition('pausada', 'en_progreso')).toBe(true);
      expect(isValidTransition('en_progreso', 'completada')).toBe(true);
    });
  });
});