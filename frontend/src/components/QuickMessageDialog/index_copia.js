import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Button,
  TextField,
  DialogContent,
  DialogActions,
  Grid,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Dialog from '../Dialog';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { i18n } from '../../translate/i18n';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithSpinner from '../ButtonWithSpinner';
import { AuthContext } from '../../context/Auth/AuthContext';
import { isNil, isObject, has, get, head } from 'lodash';
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";

const MessageSchema = Yup.object().shape({
  shortcode: Yup.string()
    .min(3, 'Too Short!')
    .max(254, 'Too Long!')
    .required('Required'),
  message: Yup.string()
    .min(3, 'Too Short!')
    .max(9999, 'Too Long!')
    .required('Required'),
});

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '350px',
    },
  },
  list: {
    width: '100%',
    maxWidth: '350px',
    maxHeight: '200px',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    width: '100%',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', // Adicionei esta linha para centralizar os elementos verticalmente
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

function QuickMessageDialog(props) {
  const classes = useStyles();

  const initialMessage = {
    id: null,
    shortcode: '',
    message: '',
  };

  const { modalOpen, saveMessage, editMessage, onClose, messageSelected } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const attachmentFile = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    verifyAndSetMessage();
    setDialogOpen(modalOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  useEffect(() => {
    verifyAndSetMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageSelected]);

  const messageSelectedIsValid = () => {
    return isObject(messageSelected) && has(messageSelected, 'id') && !isNil(get(messageSelected, 'id'));
  };

  const verifyAndSetMessage = () => {
    if (messageSelectedIsValid()) {
      const { id, message, shortcode, attachment: existingAttachment } = messageSelected;
      setMessage({ id, message, shortcode });
      if (existingAttachment) {
        setAttachment(existingAttachment);
        setAttachmentName(existingAttachment.name);
      }
    } else {
      setMessage(initialMessage);
    }
  };

  const handleClose = () => {
    onClose();
    setLoading(false);
    setAttachment(null);
    setAttachmentName('');
    attachmentFile.current.value = null;
  };

  const handleSave = async (values) => {
    if (messageSelectedIsValid()) {
      editMessage({
        ...messageSelected,
        ...values,
        userId: user.id,
        attachment: attachment,
      });
    } else {
      saveMessage({
        ...values,
        userId: user.id,
        attachment: attachment,
      });
    }
    handleClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
      setAttachmentName(file.name);
    }
  };

  const deleteAttachment = () => {
    setAttachment(null);
    setAttachmentName('');
    attachmentFile.current.value = null;
  };

  return (
    <Dialog title="Mensagem Rápida" modalOpen={dialogOpen} onClose={handleClose}>
      <Formik
        initialValues={message}
        enableReinitialize={true}
        validationSchema={MessageSchema}
        onSubmit={(values, actions) => {
          setLoading(true);
          setTimeout(() => {
            handleSave(values);
            actions.setSubmitting(false);
          }, 400);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent className={classes.root} dividers>
              <Grid direction="column" container>
                <Grid item>
                  <Field
                    as={TextField}
                    name="shortcode"
                    label={i18n.t('quickMessages.dialog.shortcode')}
                    error={touched.shortcode && Boolean(errors.shortcode)}
                    helperText={touched.shortcode && errors.shortcode}
                    variant="outlined"
                  />
                </Grid>
                <Grid item>
                  <Field
                    as={TextField}
                    name="message"
                    rows={6}
                    label={i18n.t('quickMessages.dialog.message')}
                    multiline={true}
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    variant="outlined"
                  />
                </Grid>
                {attachment && (
                  <Grid item>
                    <Button startIcon={<AttachFileIcon />}>
                      {attachmentName}
                    </Button>
                    <IconButton
                      onClick={deleteAttachment}
                      color="secondary"
                    >
                      <DeleteOutlineIcon color="secondary" />
                    </IconButton>
                  </Grid>
                )}
                <Grid item className={classes.buttonWrapper}>
                <input
  type="file"
  accept=".png, .jpg, .jpeg, .mp4, .pdf"
  ref={attachmentFile}
  onChange={(e) => handleAttachmentFile(e)}
  style={{ display: 'none' }}
/>
<Button
  onClick={() => attachmentFile.current.click()}
  color="primary"
  disabled={isSubmitting}
  variant="outlined"
  className={classes.button}
>
  Anexar
</Button>

                  <div>
                    <Button
                      onClick={handleClose}
                      color="primary"
                      className={classes.button}
                    >
                      Cancelar
                    </Button>
                    <ButtonWithSpinner
                      loading={loading}
                      color="primary"
                      type="submit"
                      variant="contained"
                      autoFocus
                    >
                      Salvar
                    </ButtonWithSpinner>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

QuickMessageDialog.propTypes = {
  modalOpen: PropTypes.bool,
  onClose: PropTypes.func,
  saveMessage: PropTypes.func,
  editMessage: PropTypes.func,
  messageSelected: PropTypes.object,
};

export default QuickMessageDialog;
