'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  MessageSquare, 
  Send, 
  User, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../../components/providers/Providers'
import toast from 'react-hot-toast'
import apiService from '../../services/api'

export default function MessagesPage() {
  const { user } = useAuth()
  const [messagesRef, messagesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [staffMembers, setStaffMembers] = useState([])
  const [formData, setFormData] = useState({
    staff: '',
    subject: '',
    message: '',
    booking: ''
  })

  useEffect(() => {
    fetchMessages()
    if (user?.user_type === 'customer') {
      fetchStaffMembers()
    }
  }, [user])

  useEffect(() => {
    filterMessages()
  }, [messages, searchTerm])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.request('/messages/')
      setMessages(response)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStaffMembers = async () => {
    try {
      const endpoint = user?.user_type === 'customer' ? '/staff/assigned/' : '/staff/'
      const response = await apiService.request(endpoint)
      const list = Array.isArray(response) ? response : []
      setStaffMembers(list.filter(staff => staff.status === 'Active'))
    } catch (error) {
      console.error('Error fetching staff members:', error)
    }
  }

  const filterMessages = () => {
    let filtered = messages

    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMessages(filtered)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!formData.staff || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await apiService.request('/messages/', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      toast.success('Message sent successfully')
      setShowComposeModal(false)
      setFormData({
        staff: '',
        subject: '',
        message: '',
        booking: ''
      })
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const markAsRead = async (messageId) => {
    try {
      await apiService.request(`/messages/${messageId}/mark-read/`, {
        method: 'POST'
      })
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please log in to view messages
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          ref={messagesRef}
          variants={containerVariants}
          initial="hidden"
          animate={messagesInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                Messages
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {user.user_type === 'customer' ? 'Contact our staff team' : 'Customer communications'}
              </p>
            </div>
            {user.user_type === 'customer' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComposeModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Message</span>
              </motion.button>
            )}
          </motion.div>

          {/* Search */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </motion.div>

          {/* Messages List */}
          {isLoading ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredMessages.length > 0 ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 ${
                    !message.is_read ? 'border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {message.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {user.user_type === 'customer' 
                              ? `To: ${message.staff_name}`
                              : `From: ${message.customer_name}`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-13">
                        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                          {message.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(message.created_at).toLocaleDateString()}</span>
                            </span>
                            {!message.is_read && (
                              <span className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-xs">
                                New
                              </span>
                            )}
                          </div>
                          
                          {!message.is_read && (
                            <button
                              onClick={() => markAsRead(message.id)}
                              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No messages found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : user.user_type === 'customer'
                    ? 'Start a conversation with our staff team.'
                    : 'No messages from customers yet.'
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                New Message
              </h2>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="form-label">To Staff Member</label>
                  <select
                    required
                    value={formData.staff}
                    onChange={(e) => setFormData({...formData, staff: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select a staff member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.full_name} - {staff.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="form-input"
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="form-input min-h-[120px] resize-none"
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

