import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactSubmission.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    submitMutation.mutate(formData);
  };

  return (
    <section className="relative py-24 px-4" style={{ background: '#F2F1F5' }}>
      {/* Background */}
      <div className="absolute inset-0">
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Get in{" "}
            <span className="bg-gradient-to-r from-[#D8A11F] to-[#F59E0B] bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#333' }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="backdrop-blur-xl bg-white/5 border border-black rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#000' }}>Send us a message</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitted && (
                  <div 
                    className="rounded-xl p-4 text-sm font-medium"
                    style={{ 
                      backgroundColor: '#dcfce7', 
                      border: '1px solid #4ade80', 
                      color: '#000000' 
                    }}
                  >
                    <span style={{ color: '#000000' }}>✓ Thank you! Your message has been sent successfully.</span>
                  </div>
                )}
                <div>
                  <label className="text-sm mb-2 block" style={{ color: '#333' }}>Your Name</label>
                  <Input
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-black placeholder:text-black focus:border-[#D8A11F] rounded-xl py-6"
                    style={{ color: '#000' }}
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block" style={{ color: '#333' }}>Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border-black placeholder:text-black focus:border-[#D8A11F] rounded-xl py-6"
                    style={{ color: '#000' }}
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block" style={{ color: '#333' }}>Subject</label>
                  <Input
                    required
                    placeholder="Partnership Opportunities"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-white border-black placeholder:text-black focus:border-[#D8A11F] rounded-xl py-6"
                    style={{ color: '#000' }}
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block" style={{ color: '#333' }}>Message</label>
                  <Textarea
                    required
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white border-black placeholder:text-black focus:border-[#D8A11F] rounded-xl min-h-[150px]"
                    style={{ color: '#000' }}
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#D8A11F] to-[#F59E0B] hover:from-[#C4900F] hover:to-[#E58E0A] text-white py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {submitMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-black rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#000' }}>Contact Information</h3>
              
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "hello@buyersalike.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Address", value: "123 Business Ave, San Francisco, CA 94102" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-black flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#666' }}>{item.label}</p>
                      <p style={{ color: '#000' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="backdrop-blur-xl bg-white/5 border border-black rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#000' }}>Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Linkedin, label: "LinkedIn", gradient: "from-blue-600 to-blue-700" },
                  { icon: Twitter, label: "Twitter", gradient: "from-sky-500 to-sky-600" },
                  { icon: Facebook, label: "Facebook", gradient: "from-blue-500 to-blue-600" },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.gradient} flex items-center justify-center transition-all duration-300 hover:shadow-lg`}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-black rounded-3xl p-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "24/7", label: "Support" },
                  { value: "<1hr", label: "Response" },
                  { value: "500+", label: "Reviews" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold" style={{ color: '#000' }}>{stat.value}</p>
                    <p className="text-sm" style={{ color: '#666' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}