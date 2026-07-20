'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  CircleDot,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ticketStatusBadge(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'open':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'in_progress':
    case 'in-progress':
      return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
    case 'waiting_user':
    case 'waiting-user':
      return 'border-purple-600/30 bg-purple-600/10 text-purple-400';
    case 'resolved':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'closed':
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
    default:
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
  }
}

function ticketStatusLabel(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'open':
      return 'Open';
    case 'in_progress':
    case 'in-progress':
      return 'In Progress';
    case 'waiting_user':
    case 'waiting-user':
      return 'Waiting User';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return status || 'Open';
  }
}

function ticketStatusIcon(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'open':
      return <CircleDot className="h-3.5 w-3.5" />;
    case 'in_progress':
    case 'in-progress':
      return <Loader2 className="h-3.5 w-3.5" />;
    case 'waiting_user':
    case 'waiting-user':
      return <AlertCircle className="h-3.5 w-3.5" />;
    case 'resolved':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'closed':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <CircleDot className="h-3.5 w-3.5" />;
  }
}

function priorityBadge(priority: string) {
  const p = priority?.toLowerCase();
  switch (p) {
    case 'low':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'medium':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'high':
      return 'border-orange-600/30 bg-orange-600/10 text-orange-400';
    case 'urgent':
    case 'critical':
      return 'border-red-600/30 bg-red-600/10 text-red-400';
    default:
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
  }
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
}

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    message: '',
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.support.list();
      const list = res.tickets || res.data || res || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreate = async () => {
    if (!form.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setCreating(true);
    try {
      await api.support.create({
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      toast.success('Ticket created successfully!');
      setForm({ subject: '', message: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-red-500" />
            Support Center
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Get help with your account, investments, or any other questions.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 self-start sm:self-center"
        >
          {showForm ? (
            <>
              <XCircle className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              New Ticket
            </>
          )}
        </Button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <Card className="border-[#262626] bg-gradient-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-500" />
              Create New Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-neutral-600 focus:border-red-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-neutral-600 focus:border-red-500/50 resize-none"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">
            My Tickets
            {!loading && tickets.length > 0 && (
              <Badge variant="outline" className="border-[#333] text-[10px] text-neutral-500 ml-2">
                {tickets.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-[#1e1e1e] space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-[#1a1a1a]" />
                  <Skeleton className="h-3 w-1/2 bg-[#1a1a1a]" />
                  <Skeleton className="h-3 w-1/3 bg-[#1a1a1a]" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <HelpCircle className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No tickets yet</p>
              <p className="text-xs mt-1">Create a ticket if you need help with anything.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f]/50 hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{ticket.subject}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge className={`${ticketStatusBadge(ticket.status)} border text-[10px] gap-1`}>
                          {ticketStatusIcon(ticket.status)}
                          {ticketStatusLabel(ticket.status)}
                        </Badge>
                        {ticket.priority && (
                          <Badge className={`${priorityBadge(ticket.priority)} border text-[10px] capitalize`}>
                            {ticket.priority}
                          </Badge>
                        )}
                        <span className="text-[11px] text-neutral-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fmtDate(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}