import { Editor, EditorPosition, MarkdownView, Plugin } from 'obsidian';

export default class AdvancedSelectionPlugin extends Plugin {
	marked_position: EditorPosition;
	one_end_position: EditorPosition;

	getEditor(): Editor {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	}

	updateCursor(cm: CodeMirror.Editor)  {
		const editor = this.getEditor();
		console.log("updateCursor: ", cm);
		console.log("editor: ", editor);
		if (editor) {
			const cursor = editor.getCursor();
			console.log("cursor: ", cursor);
			if (this.marked_position !== undefined) {
				editor.setSelection(this.marked_position, cursor);
				console.log("selection: ", editor.getSelection());
			}
		}
	}

	async onload() {
		this.addCommand({
			id: 'set-mark',
			name: 'Set mark',
			icon: 'pencil',
			hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: '2'}],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getCursor());
				this.marked_position = editor.getCursor();
			}
		});

		this.addCommand({
			id: 'clear-mark',
			name: 'Clear mark',
			icon: 'up-and-down-arrows',
			hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: '3'}],
			editorCallback: (editor: Editor, view: MarkdownView) => {
					this.marked_position = null;
			}
		});

		this.addCommand({
			id: 'select-from-mark',
			name: 'Select from mark',
			icon: 'up-and-down-arrows',
			hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: '4'}],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if(this.marked_position != null)
				{
					editor.setSelection(this.marked_position, editor.getCursor());
				}
			}
		});

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log("cm: ", cm);
			cm.on("cursorActivity", this.updateCursor);
		});

		console.log("finished ....");	
	}

	onunload() {

	}

}
