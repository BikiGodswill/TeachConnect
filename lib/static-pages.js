// Content for simple informational pages. Legal pages are DRAFTS and need review by a lawyer before launch.
export const STATIC_PAGES = {
  about: {
    title: 'About Teacher Connect',
    intro: 'Teacher Connect helps students and parents find qualified teachers and book lessons online or at home.',
    sections: [
      ['Our mission', 'Good teaching should be easy to find and easy to trust. We bring teachers, students and parents together in one place, with verified profiles, clear prices and protected payments.'],
      ['How we work', 'Teachers join for free and set their own prices. Students book a lesson, and when they pay in the app we hold the money safely until the lesson is done and the dispute window has passed.'],
    ],
  },
  help: {
    title: 'Help Center',
    intro: 'Answers to common questions.',
    sections: [
      ['How do I book a lesson?', 'Find a teacher, open their profile and choose Book a Lesson. Pick the subject, mode, date, time and how you will pay. The teacher then accepts or declines your request.'],
      ['Can I pay my teacher in cash?', 'Yes. You can pay in cash or by direct mobile money. We record the payment once both of you confirm it, but app features such as dispute protection and rewards only apply to payments made in the app.'],
      ['When does a teacher get paid?', 'Money paid in the app is held after the lesson. It becomes available after the dispute window (24 hours by default, or longer if the teacher chose a longer period).'],
      ['What if something goes wrong?', 'If you paid in the app, report a problem from your booking within the dispute window. Our team reviews it and may issue a full or partial refund.'],
    ],
  },
  contact: {
    title: 'Contact us',
    intro: 'We usually reply within one working day.',
    sections: [['Email', process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'Support contact details will be added before launch.'], ['Safety concerns', 'If anyone is in immediate danger, contact local emergency services first, then tell us.']],
  },
  safety: {
    title: 'Safety',
    intro: 'Your safety matters most, especially for in-person lessons.',
    sections: [
      ['Verified teachers', 'Teachers can submit an ID and qualifications. Our team reviews them before a Verified badge appears.'],
      ['Meeting in person', 'Meet in a safe, suitable place. Parents are welcome to be present. Tell someone where the lesson is.'],
      ['Report or block', 'You can report or block any user. We review reports promptly.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy (draft)',
    intro: 'This is a draft summary and must be reviewed by a lawyer before launch.',
    sections: [
      ['What we collect', 'Account details, teacher profile information, verification documents, booking and payment records, and messages sent through the platform.'],
      ['How we use it', 'To run the marketplace, process payments, keep users safe and resolve disputes.'],
      ['Your rights', 'You can ask to access, correct or delete your data by contacting support.'],
    ],
  },
  terms: {
    title: 'Terms of Service (draft)',
    intro: 'This is a draft and must be reviewed by a lawyer before launch.',
    sections: [
      ['Using Teacher Connect', 'Teacher Connect connects students and teachers. Teachers are independent and are responsible for the lessons they give.'],
      ['Payments', 'In-app payments include a platform fee. Payments made outside the app are between student and teacher and are not protected by Teacher Connect.'],
    ],
  },
  refunds: {
    title: 'Refund Policy (draft)',
    intro: 'This is a draft and must be reviewed by a lawyer before launch.',
    sections: [
      ['Cancelled lessons', 'If a lesson paid in the app is cancelled, declined or expires before it takes place, the payment is refunded in full.'],
      ['Problems with a lesson', 'Report a problem within the dispute window. Refunds can be full, partial or none, depending on the review.'],
      ['Payments outside the app', 'We cannot refund money that did not pass through Teacher Connect.'],
    ],
  },
  resources: {
    title: 'Resources',
    intro: 'Study guides, exam tips and teaching advice are coming soon.',
    sections: [['Want to contribute?', 'If you are a teacher and would like to write a study guide, contact us.']],
  },
};
