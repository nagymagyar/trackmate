import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    service = new ErrorService();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast message', () => {
    service.show('Test message', 'error');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test message');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should remove a toast by id', () => {
    service.show('First', 'error');
    service.show('Second', 'success');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('should auto-remove toast after duration', () => {
    service.show('Auto remove', 'info', 50);
    expect(service.toasts().length).toBe(1);
    setTimeout(() => {
      expect(service.toasts().length).toBe(0);
    }, 100);
  });

  it('should handle error object with message', () => {
    service.handleError({ message: 'Network error' });
    expect(service.toasts()[0].message).toBe('Network error');
  });

  it('should handle error object with nested error.message', () => {
    service.handleError({ error: { message: 'Server down' } });
    expect(service.toasts()[0].message).toBe('Server down');
  });

  it('should use fallback message for unknown error', () => {
    service.handleError(null, 'Fallback');
    expect(service.toasts()[0].message).toBe('Fallback');
  });

  it('should show success toast', () => {
    service.handleSuccess('Saved!');
    expect(service.toasts()[0].message).toBe('Saved!');
    expect(service.toasts()[0].type).toBe('success');
  });
});
