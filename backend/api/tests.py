from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Note


class NoteModelTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="modeluser", password="testpass123")

    def test_note_str_returns_title(self):
        note = Note.objects.create(title="My Title", content="Some content", author=self.user)
        self.assertEqual(str(note), "My Title")

    def test_note_created_at_is_set_automatically(self):
        note = Note.objects.create(title="Timed", content="content", author=self.user)
        self.assertIsNotNone(note.created_at)

    def test_note_author_relationship(self):
        note = Note.objects.create(title="Linked", content="content", author=self.user)
        self.assertIn(note, self.user.notes.all())


class UserRegistrationTest(APITestCase):
    def setUp(self):
        self.register_url = "/api/user/register/"

    def test_register_user_success(self):
        payload = {"username": "newuser", "password": "strongpassword123"}
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertNotIn("password", response.data)

    def test_register_duplicate_username_fails(self):
        User.objects.create_user(username="existing", password="pass12345")
        payload = {"username": "existing", "password": "anotherpass123"}

        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_password_fails(self):
        payload = {"username": "nopassworduser"}

        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticatedNoteAPITest(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username="usera", password="passworda123")
        self.user_b = User.objects.create_user(username="userb", password="passwordb123")

        self.note_a = Note.objects.create(
            title="User A Note", content="Belongs to A", author=self.user_a
        )
        self.note_b = Note.objects.create(
            title="User B Note", content="Belongs to B", author=self.user_b
        )

        self.notes_url = "/api/notes/"

    def _delete_url(self, pk):
        return f"/api/notes/delete/{pk}/"

    def test_list_notes_requires_authentication(self):
        response = self.client.get(self.notes_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_note_requires_authentication(self):
        response = self.client.post(self.notes_url, {"title": "T", "content": "C"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_lists_only_own_notes(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.get(self.notes_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [note["title"] for note in response.data]
        self.assertIn("User A Note", titles)
        self.assertNotIn("User B Note", titles)

    def test_authenticated_user_can_create_note(self):
        self.client.force_authenticate(user=self.user_a)
        payload = {"title": "New Note", "content": "New content"}

        response = self.client.post(self.notes_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = Note.objects.get(title="New Note")
        self.assertEqual(created.author, self.user_a)

    def test_user_can_delete_own_note(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.delete(self._delete_url(self.note_a.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=self.note_a.id).exists())

    def test_user_cannot_delete_other_users_note(self):
        self.client.force_authenticate(user=self.user_a)

        response = self.client.delete(self._delete_url(self.note_b.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(id=self.note_b.id).exists())
