import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Note from './Note'

describe('Note', () => {
  const baseNote = {
    id: 1,
    title: 'Test Note',
    content: 'This is the note content',
    created_at: '2024-01-15T10:00:00Z',
    images: null,
  }

  it('renders the title and content', () => {
    render(<Note note={baseNote} onDelete={() => {}} />)

    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByText('This is the note content')).toBeInTheDocument()
  })

  it('renders a formatted date', () => {
    render(<Note note={baseNote} onDelete={() => {}} />)

    const expected = new Date(baseNote.created_at).toLocaleDateString('en-US')
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('does not render an image when note.images is not set', () => {
    render(<Note note={baseNote} onDelete={() => {}} />)

    expect(screen.queryByAltText('Note Image')).not.toBeInTheDocument()
  })

  it('renders an image when note.images is set', () => {
    const noteWithImage = { ...baseNote, images: 'https://example.com/image.png' }

    render(<Note note={noteWithImage} onDelete={() => {}} />)

    const image = screen.getByAltText('Note Image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.png')
  })

  it('calls onDelete with the note id when the delete button is clicked', () => {
    const handleDelete = vi.fn()

    render(<Note note={baseNote} onDelete={handleDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(handleDelete).toHaveBeenCalledTimes(1)
    expect(handleDelete).toHaveBeenCalledWith(baseNote.id)
  })
})
