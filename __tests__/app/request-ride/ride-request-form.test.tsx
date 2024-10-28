// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /__tests__/app/request-ride/ride-request-form.test.tsx
// Tests for the ride request form - because even democracy needs testing!

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RideRequestForm } from '@/app/[locale]/request-ride/ride-request-form';
import { createRideRequest } from '@/app/[locale]/request-ride/actions';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the server action
jest.mock('@/app/[locale]/request-ride/actions', () => ({
  createRideRequest: jest.fn(),
}));

describe('RideRequestForm', () => {
  const mockValidFormData = {
    pickupLocation: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    votingLocation: {
      street: '456 Voting Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    pickupTime: new Date('2024-11-05T09:00:00'),
    timeWindow: '30',
    passengers: 1,
    mobilityNeeds: false,
    returnRideNeeded: false,
    specialInstructions: 'Call upon arrival',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<RideRequestForm />);

    // Check for required form fields
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred pickup time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of passengers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobility assistance needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/return ride needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/special instructions/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<RideRequestForm />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByText(/request ride/i));

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/street address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/city is required/i)).toBeInTheDocument();
    });
  });

  it('successfully submits form with valid data', async () => {
    const mockCreateRideRequest = createRideRequest as jest.Mock;
    mockCreateRideRequest.mockResolvedValueOnce({
      success: true,
      rideId: '123',
    });

    render(<RideRequestForm />);

    // Fill out pickup location
    await userEvent.type(
      screen.getAllByLabelText(/street address/i)[0], 
      mockValidFormData.pickupLocation.street
    );
    await userEvent.type(
      screen.getAllByLabelText(/city/i)[0], 
      mockValidFormData.pickupLocation.city
    );
    await userEvent.type(
      screen.getAllByLabelText(/state/i)[0], 
      mockValidFormData.pickupLocation.state
    );
    await userEvent.type(
      screen.getAllByLabelText(/zip/i)[0], 
      mockValidFormData.pickupLocation.zipCode
    );

    // Fill out voting location
    await userEvent.type(
      screen.getAllByLabelText(/street address/i)[1], 
      mockValidFormData.votingLocation.street
    );
    await userEvent.type(
      screen.getAllByLabelText(/city/i)[1], 
      mockValidFormData.votingLocation.city
    );
    await userEvent.type(
      screen.getAllByLabelText(/state/i)[1], 
      mockValidFormData.votingLocation.state
    );
    await userEvent.type(
      screen.getAllByLabelText(/zip/i)[1], 
      mockValidFormData.votingLocation.zipCode
    );

    // Set pickup time
    fireEvent.change(
      screen.getByLabelText(/preferred pickup time/i),
      { target: { value: mockValidFormData.pickupTime.toISOString().slice(0, 16) } }
    );

    // Select time window
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('30 minutes'));

    // Set number of passengers
    await userEvent.clear(screen.getByLabelText(/number of passengers/i));
    await userEvent.type(
      screen.getByLabelText(/number of passengers/i), 
      mockValidFormData.passengers.toString()
    );

    // Add special instructions
    await userEvent.type(
      screen.getByLabelText(/special instructions/i),
      mockValidFormData.specialInstructions
    );

    // Submit form
    await userEvent.click(screen.getByText(/request ride/i));

    // Verify form submission
    await waitFor(() => {
      expect(mockCreateRideRequest).toHaveBeenCalledWith(expect.objectContaining({
        pickupLocation: mockValidFormData.pickupLocation,
        votingLocation: mockValidFormData.votingLocation,
        passengers: mockValidFormData.passengers,
        specialInstructions: mockValidFormData.specialInstructions,
      }));
    });
  });

  it('handles server errors gracefully', async () => {
    const mockError = 'Server error occurred';
    const mockCreateRideRequest = createRideRequest as jest.Mock;
    mockCreateRideRequest.mockResolvedValueOnce({
      success: false,
      error: mockError,
    });

    render(<RideRequestForm />);

    // Fill out minimum required fields
    await userEvent.type(
      screen.getAllByLabelText(/street address/i)[0], 
      mockValidFormData.pickupLocation.street
    );
    // ... (fill out other required fields)

    // Submit form
    await userEvent.click(screen.getByText(/request ride/i));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });
  });

  it('validates passenger count limits', async () => {
    render(<RideRequestForm />);

    const passengerInput = screen.getByLabelText(/number of passengers/i);

    // Test for max passengers
    await userEvent.clear(passengerInput);
    await userEvent.type(passengerInput, '5');

    // Submit form
    fireEvent.click(screen.getByText(/request ride/i));

    // Check for validation message
    await waitFor(() => {
      expect(screen.getByText(/maximum 4 passengers allowed/i)).toBeInTheDocument();
    });
  });

  it('properly handles time window selection', async () => {
    render(<RideRequestForm />);

    // Open the select dropdown
    await userEvent.click(screen.getByRole('combobox'));

    // Verify all time window options are present
    expect(screen.getByText('15 minutes')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('60 minutes')).toBeInTheDocument();

    // Select a time window
    await userEvent.click(screen.getByText('30 minutes'));

    // Verify selection was made
    expect(screen.getByRole('combobox')).toHaveTextContent('30 minutes');
  });
});