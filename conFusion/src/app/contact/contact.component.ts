import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { FeedbackService } from '../services/feedback.service';
// Animations
import { flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  contactType = ContactType;
  feedback: Feedback;
  errMess: string;
  formSent = false;

  @ViewChild('fform') feedbackFormDirective;
  
  // Contains all errors for the particular form
  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required': 'First name is required',
      'minlength': 'First name must be at least 2 charcters long',
      'maxlength': 'First name cannot be more than 25 characters long'
    },
    'lastname': {
      'required': 'Last name is required',
      'minlength': 'Last name must be at least 2 charcters long',
      'maxlength': 'Last name cannot be more than 25 characters long'
    },
    'telnum': {
      'required': 'Tel. number is required',
      'pattern': 'Tel. number must contain only numbers'
    },
    'email': {
      'required': 'Email is required',
      'email': 'Email not in valid format'
    }
  };

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService) {
      this.createForm();
    }
  
  ngOnInit(): void { }
  
  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });
    
    // If an error occurs, a message with that error will be displayed in formErrors
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set form validation messages  
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error messages (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' '; 
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.feedback = null;
    this.errMess = null;
    const feedback = this.feedbackForm.value;
    console.log(feedback);
    this.feedbackService.submitFeedback(feedback)
      .subscribe(feedbackPrev => { this.feedback = feedbackPrev; setTimeout(() => this.formSent = false, 5000); },
                 errMess => { this.errMess = errMess; setTimeout(() => this.formSent = false, 5000); });
    this.formSent = true;
    this.feedbackFormDirective.resetForm();
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
  }

}