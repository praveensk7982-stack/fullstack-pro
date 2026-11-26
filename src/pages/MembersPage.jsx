import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  GraduationCap,
  Mail,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from '../api/members';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const emptyStudentForm = {
  name: '',
  registerNumber: '',
  department: DEPARTMENTS[0],
  email: '',
  phone: '',
  status: 'ACTIVE',
};

export default function MembersPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyStudentForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [borrowedModalStudent, setBorrowedModalStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers({ search, department, page, limit: 6 });
      setStudents(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, department, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchStudents();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [fetchStudents]);

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    const regNo = form.registerNumber.trim();
    if (!/^\d{12}$/.test(regNo)) {
      errors.registerNumber = 'Register number must be exactly 12 digits (numbers only)';
    }
    if (!form.department) {
      errors.department = 'Department is required';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Valid email address is required';
    }
    if (!form.phone.trim() || form.phone.trim().length < 7) {
      errors.phone = 'Phone number must be at least 7 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyStudentForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      registerNumber: student.registerNumber || '',
      department: student.department || DEPARTMENTS[0],
      email: student.email,
      phone: student.phone,
      status: student.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        registerNumber: form.registerNumber.trim(),
        department: form.department,
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status,
      };

      if (editingStudent) {
        await updateMember(editingStudent.id, payload);
        toast.success('Student updated successfully');
      } else {
        await createMember(payload);
        toast.success('Student registered successfully');
      }

      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Unable to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMember(deleteTarget.id);
      toast.success(`Removed student "${deleteTarget.name}"`);
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Unable to delete student');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register and manage {total} university students and inspect their currently borrowed books (max 3 per student).
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-dark text-white text-sm font-semibold shadow-md shadow-crimson/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Register Student</span>
        </button>
      </div>

      {/* Search & Department Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, register number, department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
          />
        </div>

        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by department"
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson sm:min-w-[260px]"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner label="Loading students directory..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try another search query, clear the department filter, or register a new student."
          action={
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-crimson text-white text-sm font-semibold"
            >
              Register Student
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Register No</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-crimson-light text-crimson font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {student.registerNumber || '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <GraduationCap className="h-3.5 w-3.5 text-crimson shrink-0" />
                        <span>{student.department || '—'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 whitespace-nowrap">
                      {student.phone}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setBorrowedModalStudent(student)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            student.borrowedCount > 0
                              ? 'bg-crimson-light text-crimson hover:bg-crimson hover:text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="View borrowed books"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{student.borrowedCount}/3</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="p-2 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100 transition-colors"
                          title="Edit student"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(student)}
                          className="p-2 rounded-lg text-gray-500 hover:text-crimson hover:bg-crimson-light transition-colors"
                          title="Delete student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page <strong className="text-gray-900">{page}</strong> of{' '}
              <strong className="text-gray-900">{totalPages}</strong> ({total} students)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-crimson hover:text-crimson disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Register New Student'}
      >
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Arun Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            />
            {formErrors.name && (
              <p className="text-xs text-crimson mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Register Number (12 digits) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={form.registerNumber}
                onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                placeholder="961223202045"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.registerNumber && (
                <p className="text-xs text-crimson mt-1">{formErrors.registerNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {formErrors.department && (
                <p className="text-xs text-crimson mt-1">{formErrors.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="arun@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.email && (
                <p className="text-xs text-crimson mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {formErrors.phone && (
                <p className="text-xs text-crimson mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-crimson hover:bg-crimson-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Currently Borrowed Books Modal */}
      <Modal
        isOpen={Boolean(borrowedModalStudent)}
        onClose={() => setBorrowedModalStudent(null)}
        title={
          borrowedModalStudent
            ? `Borrowed Books — ${borrowedModalStudent.name} (${borrowedModalStudent.registerNumber || 'N/A'})`
            : 'Borrowed Books'
        }
        maxWidth="max-w-xl"
      >
        {borrowedModalStudent && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
            <span>
              Student: <strong className="text-gray-900">{borrowedModalStudent.name}</strong>
            </span>
            <span>
              Register No:{' '}
              <strong className="font-mono text-gray-900">
                {borrowedModalStudent.registerNumber || '—'}
              </strong>
            </span>
          </div>
        )}

        {!borrowedModalStudent?.borrowedBooks?.length ? (
          <EmptyState
            icon={BookOpen}
            title="No books currently borrowed"
            description={`${borrowedModalStudent?.name || 'This student'} has 0 active checkouts (limit: 3).`}
          />
        ) : (
          <div className="space-y-3">
            {borrowedModalStudent.borrowedBooks.map((item) => (
              <div
                key={item.issueId}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">ISBN {item.isbn}</p>
                </div>

                <div className="text-left sm:text-right space-y-1 shrink-0">
                  {item.status === 'OVERDUE' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-crimson border border-red-200">
                      <Clock className="h-3 w-3" />
                      OVERDUE ({item.overdueDays}d)
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      ISSUED
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    Due:{' '}
                    {new Date(item.dueDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Student"
        message={`Are you sure you want to delete student "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
