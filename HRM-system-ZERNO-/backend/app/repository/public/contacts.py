from sqlalchemy.future import select
from app.model import Contact
from app.repository.base import BaseRepository
from app.schema.emps.contacts import ContactCreate, ContactUpdate


class ContactRepository(BaseRepository):

    async def get_all_contacts(self) -> list[Contact]:
        result = await self.connection.execute(select(Contact))
        contacts = result.scalars().all()
        return list(contacts)

    async def get_contact_by_id(self, contact_id: int) -> Contact | None:
        result = await self.connection.execute(select(Contact).filter(Contact.id == contact_id))
        contact = result.scalars().first()
        return contact

    async def create_contact(self, contact_create: ContactCreate) -> Contact:
        contact = Contact(**contact_create.model_dump())
        self.connection.add(contact)
        await self.connection.flush()
        await self.connection.refresh(contact)
        return contact

    async def update_contact(self, contact: Contact, contact_update: ContactUpdate) -> Contact:
        update_fields = contact_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(contact, field, value)

        self.connection.add(contact)
        await self.connection.flush()
        await self.connection.refresh(contact)
        return contact

    async def delete_contact(self, contact: Contact) -> dict:
        await self.connection.delete(contact)
        await self.connection.flush()
        return {"detail": "Contact deleted"}
