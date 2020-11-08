import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from "../shared/dish";
import { DishService } from '../services/dish.service';
// switchMap helps make use of the params Observable
import { switchMap } from 'rxjs/operators';
// Reactive form
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
// Animations
import { visibility, flyInOut, expand } from '../animations/app.animation';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  // A new variable of dish Ids (array)
  dishIds: string[];
  prev: string;
  next: string;
  // Comment form
  commentForm: FormGroup;
  comment: Comment;
  // Modified dish
  dishcopy: Dish;
  // Visibility 
  visibility = 'shown'

  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Name is required',
      'minlength': 'Name must be at least 2 characters long',
      'maxlength': 'Name cannot be more than 25 characters long'
    },
    'comment': {
      'required': 'Comment is required',
      'minlength': ' Comment must be at least 2 characters long'
    },
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cm: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
     }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    // params Observable
    this.route.params
      .pipe(switchMap((params: Params) => { this. visibility = 'hidden'; return this.dishService.getDish(params['id']); })) 
      .subscribe((dish) => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess );
  }

  // Find the previous and next dish Id
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.commentForm = this.cm.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(2)] ]
    });

    // If an error occurs, a message with that error will be displayed in formErrors
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set form validation messages 
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
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
    this.comment = this.commentForm.value;
    const date = new Date();
    this.comment.date = date.toISOString();
    console.log(this.comment);
    // Update the UI with the new dish information & add the new comment in the Comment section
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess });
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
    this.commentFormDirective.resetForm();
  }

}
