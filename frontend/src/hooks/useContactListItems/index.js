import api from "../../services/api";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  WhatsApp,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";

const reducer = (state, action) => {
  if ("LOAD_USERS" === action.type) {
    const users = [...state, ...action.payload];
    action.payload.forEach((user) => {
      const isUserExist = (u) => u.id === user.id;
      let index = state.findIndex(isUserExist);
      if (index !== -1) {
        state[index] = user;
      } else {
        state.push(user);
      }
    });
    return [...state];
  }
  if ("UPDATE_USERS" === action.type) {
    const updatedUser = action.payload;
    const index = state.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      state[index] = updatedUser;
      return [...state];
    }
    return [updatedUser, ...state];
  }
  if ("DELETE_USER" === action.type) {
    const userId = action.payload;
    const index = state.findIndex((u) => u.id === userId);
    if (index !== -1) {
      state.splice(index, 1);
    }
    return [...state];
  }
  if ("RESET" === action.type) {
    return [];
  }
};

const Users = () => {
  const classes = makeStyles((theme) => ({
    mainPaper: {
      flex: 1,
      padding: theme.spacing(1),
      overflowY: "scroll",
      ...theme.scrollbarStyles,
    },
  }))();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_USERS", payload: response.data.users });
          setHasMore(response.data.hasMore);
          setLoading(false);
        } catch (error) {
          toastError(error);
        }
      };
      fetchData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });
    return () => {
      socket.disconnect();
    };
  }, []);

  const openUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearchParamChange = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const openUserEditModal = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (error) {
      toastError(error);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handlePageScroll = (event) => {
    if (!hasMore || loading) return;
    const target = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingUser && `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => deleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <UserModal
        open={userModalOpen}
        onClose={closeUserModal}
        userId={selectedUser && selectedUser.id}
        aria-labelledby="form-dialog-title"
      />

      <MainHeader>
        <Title>{`${i18n.t("users.title")} (${users.length})`}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearchParamChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary" onClick={openUserModal}>
            {i18n.t("users.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" onScroll={handlePageScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("users.table.id")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.status")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.profile")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.whatsapp")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.startWork")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.endWork")}</TableCell>
              <TableCell align="center">{i18n.t("users.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.id}</TableCell>
                <TableCell align="center">
                  <WhatsApp />
                </TableCell>
                <TableCell align="center">{user.name}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.profile}</TableCell>
                <TableCell align="center">{user.whatsapp?.name}</TableCell>
                <TableCell align="center">{user.startWork}</TableCell>
                <TableCell align="center">{user.endWork}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => openUserEditModal(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => setConfirmModalOpen(true)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={8} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Users;
