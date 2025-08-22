import React, { useState } from 'react';

const initialForm = {
	name: '',
	email: '',
	subject: '',
	message: ''
};

const Contact = () => {
	const [form, setForm] = useState(initialForm);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// No validation or backend connection yet
		// Keep values in place for now
		console.log('Contact form submitted (placeholder):', form);
	};

	return (
		<div className="container">
			<div className="page-header">
				<h1>Contact Us</h1>
				<p>We’d love to hear from you. Send us a message and we’ll respond soon.</p>
			</div>

			<div className="grid grid-cols-1">
				<div className="card">
					<form className="auth-form" onSubmit={handleSubmit} noValidate>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="name">Full Name</label>
								<input
									id="name"
									name="name"
									type="text"
									className={`form-input`}
									placeholder="Enter your full name"
									value={form.name}
									onChange={handleChange}
									autoComplete="name"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input
									id="email"
									name="email"
									type="email"
									className={`form-input`}
									placeholder="name@example.com"
									value={form.email}
									onChange={handleChange}
									autoComplete="email"
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="subject">Subject</label>
							<input
								id="subject"
								name="subject"
								type="text"
								className={`form-input`}
								placeholder="How can we help?"
								value={form.subject}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="message">Message</label>
							<textarea
								id="message"
								name="message"
								className={`form-textarea`}
								placeholder="Write your message here..."
								rows={5}
								value={form.message}
								onChange={handleChange}
							/>
						</div>

						<button type="submit" className="btn btn-primary">Send Message</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Contact;


