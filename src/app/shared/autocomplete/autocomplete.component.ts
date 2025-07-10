import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormControl,
} from '@angular/forms';

interface Suggestion {
  jarFav: string;
  groups: any[];
  uid: string;
  username: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent {
  @Input() placeholder: string = '';
  @Input() suggestions: Suggestion[] = [];
  @Input() selectedItemsControl!: FormArray;
  @Input() allowItemRemoval: boolean = true

  showSuggestions = false;
  searchText = '';
  selectedItems: Suggestion[] = [];
  filteredSuggestions: Suggestion[] = [];

  filterSuggestions() {
    const input = this.searchText.toLowerCase();
    this.filteredSuggestions = this.suggestions.filter(
      (item) =>
        item.username.toLowerCase().includes(input) &&
        !this.selectedItems.some((selected) => selected.uid === item.uid)
    );
    this.showSuggestions = this.filteredSuggestions.length > 0;
  }

  removeItem(index: number) {
    if(!this.allowItemRemoval)return
    this.selectedItemsControl?.removeAt(index);
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectionSuggestion(item: Suggestion) {
    this.selectedItemsControl?.push(new FormControl(item));
    this.searchText = '';
    this.filteredSuggestions = [];
    this.showSuggestions = false;
  }
}
