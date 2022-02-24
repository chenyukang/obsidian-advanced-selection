import { cmpPos } from 'codemirror';
import { Editor, EditorPosition, MarkdownView, Plugin } from 'obsidian';
declare const CodeMirror: any;


export default class AdvancedSelectionPlugin extends Plugin {
	one_end_position: EditorPosition;

	private editorMode: 'cm5' | 'cm6' = null;
	private initialized = false;

	private getCodeMirror(view: MarkdownView): CodeMirror.Editor {
		// For CM6 this actually returns an instance of the object named CodeMirror from cm_adapter of codemirror_vim
		if (this.editorMode == 'cm6')
			return (view as any).sourceMode?.cmEditor?.cm?.cm;
		else
			return (view as any).sourceMode?.cmEditor;
	}

	getEditor(): Editor {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	}

	cmEditor(): CodeMirror.Editor {
		return this.getCodeMirror(this.app.workspace.getActiveViewOfType(MarkdownView));
	}
	
	updateCursor(cm: CodeMirror.Editor)  {
		const editor = this.getEditor();
		console.log("updateCursor: ", cm);
		console.log("editor: ", editor);
		console.log("cursor: ", editor.getCursor());
	}

	async initialize() {
		if (this.initialized)
			return;

		// Determine if we have the legacy Obsidian editor (CM5) or the new one (CM6).
		// This is only available after Obsidian is fully loaded, so we do it as part of the `file-open` event.
		if ('editor:toggle-source' in (this.app as any).commands.editorCommands) {
			this.editorMode = 'cm6';
			console.log('using CodeMirror 6 mode');
		} else {
			this.editorMode = 'cm5';
			console.log('using CodeMirror 5 mode');
		}
		this.initialized = true;
	}

	async onload() {
		await this.initialize();
		this.addCommand({
			id: 'set-mark',
			name: 'Set mark',
			icon: 'pencil',
			hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: '2'}],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getCursor());
				this.one_end_position= editor.getCursor();
				// this technique is learnt from "https://github.com/esm7/obsidian-vimrc-support/blob/master/main.ts"
				const cm = this.getCodeMirror(view);				
				cm.on("cursorActivity", (instance: any) => {				
					console.log("moved ....");
					console.log(cm.getCursor());
				});
				console.log("finished hook");
			}
		});
		this.addCommand({
			id: 'select-from-mark',
			name: 'Select from mark',
			icon: 'up-and-down-arrows',
			hotkeys: [{modifiers: ['Ctrl', 'Shift'], key: '3'}],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if(this.one_end_position != null)
				{
					editor.setSelection(this.one_end_position, editor.getCursor());
				}
			}
		});


		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			cm.on("cursorActivity", (instance: any) => {
				const cursor = cm.getCursor();
				console.log("now cursor: ", cursor);				
			});
		});
/* 
		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log("cm: ", cm);
			cm.on("cursorActivity", this.updateCursor);
		}); */
	}

	onunload() {

	}

}
