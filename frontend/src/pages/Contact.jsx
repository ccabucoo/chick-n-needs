import React, { useState, useEffect } from 'react';

// Initial form state with all required fields
const initialForm = {
	name: '',
	email: '',
	concernType: '',
	subject: '',
	message: ''
};

// Initial form errors state
const initialErrors = {
	name: '',
	email: '',
	concernType: '',
	subject: '',
	message: '',
	general: ''
};

const Contact = () => {
	// State for form data
	const [form, setForm] = useState(initialForm);
	
	// State for form errors
	const [errors, setErrors] = useState(initialErrors);
	
	// State for form submission
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	// State for success message
	const [successMessage, setSuccessMessage] = useState('');
	
	// State for concern types dropdown
	const [concernTypes, setConcernTypes] = useState([]);
	
	// State for loading concern types
	const [loadingConcernTypes, setLoadingConcernTypes] = useState(true);

	// Fetch concern types from API when component mounts
	useEffect(() => {
		const fetchConcernTypes = async () => {
			try {
				const response = await fetch('/api/contact/concern-types');
				const data = await response.json();
				
				if (data.success) {
					setConcernTypes(data.data);
				} else {
					console.error('Failed to fetch concern types:', data.error);
					// Fallback concern types if API fails
					setConcernTypes([
						{ value: 'general', label: 'General Inquiry' },
						{ value: 'product_inquiry', label: 'Product Inquiry' },
						{ value: 'order_support', label: 'Order Support' },
						{ value: 'technical_issue', label: 'Technical Issue' },
						{ value: 'billing', label: 'Billing Question' },
						{ value: 'partnership', label: 'Partnership Opportunity' },
						{ value: 'feedback', label: 'Feedback & Suggestions' },
						{ value: 'complaint', label: 'Complaint' }
					]);
				}
			} catch (error) {
				console.error('Error fetching concern types:', error);
				// Fallback concern types if network fails
				setConcernTypes([
					{ value: 'general', label: 'General Inquiry' },
					{ value: 'product_inquiry', label: 'Product Inquiry' },
					{ value: 'order_support', label: 'Order Support' },
					{ value: 'technical_issue', label: 'Technical Issue' },
					{ value: 'billing', label: 'Billing Question' },
					{ value: 'partnership', label: 'Partnership Opportunity' },
					{ value: 'feedback', label: 'Feedback & Suggestions' },
					{ value: 'complaint', label: 'Complaint' }
				]);
			} finally {
				setLoadingConcernTypes(false);
			}
		};

		fetchConcernTypes();
	}, []);

	// Input filtering function to prevent invalid characters
	const filterInput = (name, value) => {
		switch (name) {
			case 'name':
				// Only allow letters, spaces, hyphens, apostrophes, and periods
				return value.replace(/[^a-zA-Z\s\-'\.]/g, '');
			case 'email':
				// Allow valid email characters and convert to lowercase
				return value.toLowerCase().replace(/[^a-zA-Z0-9@._%+-]/g, '');
			case 'subject':
				// Allow letters, numbers, spaces, and common punctuation
				return value.replace(/[^a-zA-Z0-9\s\-_.,!?()]/g, '');
			case 'message':
				// Allow letters, numbers, spaces, and common punctuation
				return value.replace(/[^a-zA-Z0-9\s\-_.,!?()@#$%&*+=:;'"<>]/g, '');
			default:
				return value;
		}
	};

	// Handle input changes with filtering and real-time validation
	const handleChange = (e) => {
		const { name, value } = e.target;
		
		// Filter input based on field type
		const filteredValue = filterInput(name, value);
		
		// Update form state with filtered value
		setForm((prev) => ({ ...prev, [name]: filteredValue }));
		
		// Clear specific field error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
		
		// Clear general error when user makes changes
		if (errors.general) {
			setErrors((prev) => ({ ...prev, general: '' }));
		}
		
		// Clear success message when user makes changes
		if (successMessage) {
			setSuccessMessage('');
		}
	};

	// Handle paste events to filter pasted content
	const handlePaste = (e) => {
		const { name } = e.target;
		const pastedText = e.clipboardData.getData('text');
		const filteredText = filterInput(name, pastedText);
		
		// If the pasted text was filtered, prevent the default paste and set the filtered value
		if (filteredText !== pastedText) {
			e.preventDefault();
			const { selectionStart, selectionEnd } = e.target;
			const currentValue = form[name];
			const newValue = currentValue.substring(0, selectionStart) + filteredText + currentValue.substring(selectionEnd);
			setForm((prev) => ({ ...prev, [name]: newValue }));
		}
	};

	// Enhanced client-side validation function with filtering
	const validateForm = () => {
		const newErrors = { ...initialErrors };
		let isValid = true;

		// Validate name with enhanced filtering
		const nameValue = form.name.trim();
		if (!nameValue) {
			newErrors.name = 'Name is required';
			isValid = false;
		} else if (nameValue.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
			isValid = false;
		} else if (nameValue.length > 100) {
			newErrors.name = 'Name must be less than 100 characters';
			isValid = false;
		} else if (!/^[a-zA-Z\s\-'\.]+$/.test(nameValue)) {
			newErrors.name = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
			isValid = false;
		} else if (nameValue.split(' ').length < 2) {
			newErrors.name = 'Please enter your full name (first and last name)';
			isValid = false;
		} else if (/^[a-zA-Z\s\-'\.]*[a-zA-Z]{1}[a-zA-Z\s\-'\.]*$/.test(nameValue) && nameValue.length < 3) {
			newErrors.name = 'Name appears to be too short';
			isValid = false;
		}

		// Validate email with enhanced filtering
		const emailValue = form.email.trim().toLowerCase();
		if (!emailValue) {
			newErrors.email = 'Email is required';
			isValid = false;
		} else if (emailValue.length > 255) {
			newErrors.email = 'Email address is too long';
			isValid = false;
		} else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
			newErrors.email = 'Please enter a valid email address';
			isValid = false;
		} else if (emailValue.includes('..') || emailValue.startsWith('.') || emailValue.endsWith('.')) {
			newErrors.email = 'Email address format is invalid';
			isValid = false;
		} else if (emailValue.split('@')[0].length < 2) {
			newErrors.email = 'Email username must be at least 2 characters';
			isValid = false;
		}

		// Validate concern type
		if (!form.concernType) {
			newErrors.concernType = 'Please select a concern type';
			isValid = false;
		} else if (!['general', 'product_inquiry', 'order_support', 'technical_issue', 'billing', 'partnership', 'feedback', 'complaint'].includes(form.concernType)) {
			newErrors.concernType = 'Please select a valid concern type';
			isValid = false;
		}

		// Validate subject with enhanced filtering
		const subjectValue = form.subject.trim();
		if (!subjectValue) {
			newErrors.subject = 'Subject is required';
			isValid = false;
		} else if (subjectValue.length < 5) {
			newErrors.subject = 'Subject must be at least 5 characters';
			isValid = false;
		} else if (subjectValue.length > 255) {
			newErrors.subject = 'Subject must be less than 255 characters';
			isValid = false;
		} else if (/^[^a-zA-Z0-9]*$/.test(subjectValue)) {
			newErrors.subject = 'Subject must contain at least one letter or number';
			isValid = false;
		} else if (subjectValue.split(' ').length < 2) {
			newErrors.subject = 'Subject must be more descriptive (at least 2 words)';
			isValid = false;
		}

		// Validate message with enhanced filtering
		const messageValue = form.message.trim();
		if (!messageValue) {
			newErrors.message = 'Message is required';
			isValid = false;
		} else if (messageValue.length < 10) {
			newErrors.message = 'Message must be at least 10 characters';
			isValid = false;
		} else if (messageValue.length > 2000) {
			newErrors.message = 'Message must be less than 2000 characters';
			isValid = false;
		} else if (/^[^a-zA-Z0-9]*$/.test(messageValue)) {
			newErrors.message = 'Message must contain at least one letter or number';
			isValid = false;
		} else if (messageValue.split(' ').length < 3) {
			newErrors.message = 'Message must be more descriptive (at least 3 words)';
			isValid = false;
		} else if (messageValue.split('\n').length > 20) {
			newErrors.message = 'Message has too many line breaks';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Clear previous messages
		setSuccessMessage('');
		setErrors(initialErrors);
		
		// Validate form
		if (!validateForm()) {
			return;
		}
		
		// Set submitting state
		setIsSubmitting(true);
		
		try {
			// Prepare form data for API
			const formData = {
				name: form.name.trim(),
				email: form.email.trim(),
				concernType: form.concernType,
				subject: form.subject.trim(),
				message: form.message.trim()
			};
			
			// Send form data to backend API
			const response = await fetch('/api/contact/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)
			});
			
			const data = await response.json();
			
			if (response.ok && data.success) {
				// Success - show success message and reset form
				setSuccessMessage(data.message);
				setForm(initialForm);
			} else {
				// Handle API errors
				if (data.details && Array.isArray(data.details)) {
					// Handle validation errors from server
					const serverErrors = { ...initialErrors };
					data.details.forEach(error => {
						if (error.path && error.msg) {
							serverErrors[error.path] = error.msg;
						}
					});
					setErrors(serverErrors);
				} else {
					// Handle general API errors
					setErrors(prev => ({ ...prev, general: data.error || 'Failed to submit your message. Please try again.' }));
				}
			}
		} catch (error) {
			console.error('Contact form submission error:', error);
			setErrors(prev => ({ ...prev, general: 'Network error. Please check your connection and try again.' }));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container">
			<div className="page-header">
				<h1>Contact Us</h1>
				<p>We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
			</div>

			<div className="grid grid-cols-1">
				<div className="card">
					<form className="auth-form" onSubmit={handleSubmit} noValidate>
						{/* Success Message */}
						{successMessage && (
							<div className="alert alert-success" role="alert">
								{successMessage}
							</div>
						)}

						{/* General Error Message */}
						{errors.general && (
							<div className="alert alert-danger" role="alert">
								{errors.general}
							</div>
						)}

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="name">Full Name *</label>
								<input
									id="name"
									name="name"
									type="text"
									className={`form-input ${errors.name ? 'error' : ''}`}
									placeholder="Enter your full name (first and last name)"
									value={form.name}
									onChange={handleChange}
									onPaste={handlePaste}
									autoComplete="name"
									disabled={isSubmitting}
									maxLength={100}
								/>
								{errors.name && <div className="error-message">{errors.name}</div>}
							</div>
							<div className="form-group">
								<label htmlFor="email">Email Address *</label>
								<input
									id="email"
									name="email"
									type="email"
									className={`form-input ${errors.email ? 'error' : ''}`}
									placeholder="name@example.com"
									value={form.email}
									onChange={handleChange}
									onPaste={handlePaste}
									autoComplete="email"
									disabled={isSubmitting}
									maxLength={255}
								/>
								{errors.email && <div className="error-message">{errors.email}</div>}
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="concernType">Concern Type *</label>
							<select
								id="concernType"
								name="concernType"
								className={`form-input ${errors.concernType ? 'error' : ''}`}
								value={form.concernType}
								onChange={handleChange}
								disabled={isSubmitting || loadingConcernTypes}
							>
								<option value="">Select your concern type</option>
								{concernTypes.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
							{errors.concernType && <div className="error-message">{errors.concernType}</div>}
							{loadingConcernTypes && <div className="loading-text">Loading concern types...</div>}
						</div>

						<div className="form-group">
							<label htmlFor="subject">Subject *</label>
							<input
								id="subject"
								name="subject"
								type="text"
								className={`form-input ${errors.subject ? 'error' : ''}`}
								placeholder="Brief description of your inquiry (at least 2 words)"
								value={form.subject}
								onChange={handleChange}
								onPaste={handlePaste}
								disabled={isSubmitting}
								maxLength={255}
							/>
							{errors.subject && <div className="error-message">{errors.subject}</div>}
							<div className="character-count">
								{form.subject.length}/255 characters
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="message">Message *</label>
							<textarea
								id="message"
								name="message"
								className={`form-textarea ${errors.message ? 'error' : ''}`}
								placeholder="Please provide detailed information about your inquiry (at least 3 words)..."
								rows={6}
								value={form.message}
								onChange={handleChange}
								onPaste={handlePaste}
								disabled={isSubmitting}
								maxLength={2000}
							/>
							{errors.message && <div className="error-message">{errors.message}</div>}
							<div className="character-count">
								{form.message.length}/2000 characters
							</div>
						</div>

						<button 
							type="submit" 
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<span className="loading-spinner"></span>
									Sending Message...
								</>
							) : (
								'Send Message'
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Contact;


