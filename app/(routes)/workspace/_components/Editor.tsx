"use client";

import React, { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
// @ts-ignore
import Checklist from "@editorjs/checklist";
// @ts-ignore
import DragDrop from "editorjs-drag-drop";
// @ts-ignore
import Paragraph from "@editorjs/paragraph";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { FILE } from "../../dashboard/_components/FileList";

const rawDocument = {
  time: 1550476186479,
  blocks: [
    {
      data: {
        text: "Document name",
        level: 2,
      },
      id: "123",
      type: "header",
    },
    {
      data: {
        level: 4,
      },
      id: "1234",
      type: "header",
    },
  ],
  version: "2.8.1",
};

function Editor({ onSaveTrigger, fileId, fileData }: { onSaveTrigger: any; fileId: any; fileData: FILE }) {
  const ref = useRef<EditorJS>();
  const [document, setDocument] = useState(rawDocument);
  const updateDocument = useMutation(api.files.updateDocument);

  useEffect(() => {
    fileData && initEditor();
  }, [fileData]);

  useEffect(() => {
    console.log("trigger", onSaveTrigger);
    onSaveTrigger && onSaveDocument();
  }, [onSaveTrigger]);

  const initEditor = () => {
    const editor = new EditorJS({
      onReady: () => {
        new DragDrop(editor);
      },
      tools: {
        header: {
          class: Header as unknown as BlockToolConstructable, // Cast to the expected type
          shortcut: "CMD+SHIFT+H",
          config: {
            placeholder: "Enter a Header",
          },
        },
        list: {
          class: List as unknown as BlockToolConstructable, // Cast to the expected type
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
      },

      holder: "editorjs",
      data: fileData?.document ? JSON.parse(fileData.document) : rawDocument,
    });
    ref.current = editor;
  };

  const onSaveDocument = () => {
    if (ref.current) {
      ref.current.save().then((outputData) => {
        console.log("Article data: ", outputData);
        updateDocument({
          _id: fileId,
          document: JSON.stringify(outputData),
        }).then(
          (resp) => {
            toast("Document Updated");
          },
          (e) => {
            toast("Failed to update document");
          }
        );
      }).catch((error) => {
        console.log("Saving failed: ", error);
      });
    }
  };

  return (
    <div>
      <div id="editorjs" className="ml-20"></div>
    </div>
  );
}

export default Editor;
