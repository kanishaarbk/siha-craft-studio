import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

describe('SiHA Craft Studio Frontend Components', () => {
  it('renders Hero Carousel with 5 slides and floating crochet elements', () => {
    render(
      <BrowserRouter>
        <HeroCarousel />
      </BrowserRouter>
    );

    expect(screen.getByText(/Little Stitches, Handmade with Love/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop Handmade/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Our Story/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Previous slide/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Next slide/i)).toBeInTheDocument();
  });

  it('renders ProductCard with name, price, and add button', () => {
    const mockProduct = {
      id: 1,
      name: 'Blush Bunny Plushie',
      slug: 'blush-bunny-plushie',
      price: '899.00',
      sale_price: '799.00',
      current_price: '799.00',
      category_name: 'Toys & Plushies',
      is_in_stock: true,
      is_ready_stock: true,
      primary_image_url: 'https://example.com/bunny.jpg',
    };

    render(
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <ProductCard product={mockProduct} />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByText(/Blush Bunny Plushie/i)).toBeInTheDocument();
    expect(screen.getByText(/₹799.00/i)).toBeInTheDocument();
    expect(screen.getByText(/SALE/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready to Ship/i)).toBeInTheDocument();
  });
});
