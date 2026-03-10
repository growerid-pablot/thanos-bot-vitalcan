import { contacts, type ContactRecord } from '@/data/contacts';

export function getAllContacts(): ContactRecord[] {
  return contacts.filter(c => c.active);
}

export function findContactByIdNumber(query: string): ContactRecord | null {
  const q = query.replace(/[\s-]/g, '');
  return contacts.find(c => {
    if (!c.identificationNumber) return false;
    return c.identificationNumber.replace(/[\s-]/g, '') === q;
  }) ?? null;
}

export function findContactByName(query: string): ContactRecord[] {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (q.length < 2) return [];

  return getAllContacts().filter(c => {
    const name = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q);
  });
}

export function findContactByEmail(email: string): ContactRecord | null {
  const q = email.toLowerCase().trim();
  return contacts.find(c => c.email?.toLowerCase() === q) ?? null;
}
