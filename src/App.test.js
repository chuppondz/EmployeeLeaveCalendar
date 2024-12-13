import { render, screen } from '@testing-library/react';
import EmployeeLeaveCalendar from './EmployeeLeaveCalendar';

test('renders learn react link', () => {
  render(<EmployeeLeaveCalendar />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
