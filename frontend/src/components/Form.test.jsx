import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Form from './Form'
import api from '../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Form', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders username and password inputs and a submit button with the login label', () => {
    render(<Form route="/api/token/" method="login" />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders the register label when method is "register"', () => {
    render(<Form route="/api/user/register/" method="register" />)

    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
  })

  it('on successful login, stores tokens and navigates to "/"', async () => {
    const user = userEvent.setup()
    api.post.mockResolvedValueOnce({
      data: { access: 'fake-access-token', refresh: 'fake-refresh-token' },
    })

    render(<Form route="/api/token/" method="login" />)

    await user.type(screen.getByPlaceholderText('Username'), 'testuser')
    await user.type(screen.getByPlaceholderText('Password'), 'testpass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/token/', {
        username: 'testuser',
        password: 'testpass',
      })
    })

    expect(localStorage.getItem(ACCESS_TOKEN)).toBe('fake-access-token')
    expect(localStorage.getItem(REFRESH_TOKEN)).toBe('fake-refresh-token')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('on successful registration, navigates to "/login" without storing tokens', async () => {
    const user = userEvent.setup()
    api.post.mockResolvedValueOnce({ data: {} })

    render(<Form route="/api/user/register/" method="register" />)

    await user.type(screen.getByPlaceholderText('Username'), 'newuser')
    await user.type(screen.getByPlaceholderText('Password'), 'newpass')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN)).toBeNull()
  })

  it('shows an alert with the error detail when the request fails', async () => {
    const user = userEvent.setup()
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } },
    })

    render(<Form route="/api/token/" method="login" />)

    await user.type(screen.getByPlaceholderText('Username'), 'baduser')
    await user.type(screen.getByPlaceholderText('Password'), 'badpass')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials')
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
